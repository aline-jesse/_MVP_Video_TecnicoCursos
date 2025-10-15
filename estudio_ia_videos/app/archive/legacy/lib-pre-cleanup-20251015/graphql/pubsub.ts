

// Simple in-memory pub/sub for development
// In production, use Redis or other message broker

interface Subscription {
  id: string
  topic: string
  callback: (data: any) => void
}

class SimplePubSub {
  private subscriptions: Map<string, Subscription[]> = new Map()
  private subscriptionCounter = 0

  publish(topic: string, payload: any): void {
    const subscriptions = this.subscriptions.get(topic) || []
    subscriptions.forEach(subscription => {
      try {
        subscription.callback(payload)
      } catch (error) {
        console.error('Error in subscription callback:', error)
      }
    })
  }

  subscribe(topic: string, callback: (data: any) => void): () => void {
    const subscriptionId = `sub-${++this.subscriptionCounter}`
    const subscription: Subscription = {
      id: subscriptionId,
      topic,
      callback
    }

    const existing = this.subscriptions.get(topic) || []
    existing.push(subscription)
    this.subscriptions.set(topic, existing)

    // Return unsubscribe function
    return () => {
      const subscriptions = this.subscriptions.get(topic) || []
      const filtered = subscriptions.filter(sub => sub.id !== subscriptionId)
      this.subscriptions.set(topic, filtered)
    }
  }

  asyncIterator(topics: string | string[]) {
    const topicArray = Array.isArray(topics) ? topics : [topics]
    const pullQueue: any[] = []
    const pushQueue: any[] = []
    let listening = true

    const pushValue = (data: any) => {
      if (pullQueue.length > 0) {
        const resolver = pullQueue.shift()
        if (resolver) {
          resolver({ value: data, done: false })
        }
      } else {
        pushQueue.push(data)
      }
    }

    const unsubscribeFunctions = topicArray.map(topic =>
      this.subscribe(topic, pushValue)
    )

    const emptyQueue = () => {
      if (listening) {
        listening = false
        unsubscribeFunctions.forEach(unsub => unsub())
        
        // Resolve all pending pulls
        pullQueue.forEach(resolver => {
          resolver({ value: undefined, done: true })
        })
        pullQueue.length = 0
        pushQueue.length = 0
      }
    }

    return {
      async next() {
        if (!listening) {
          return { value: undefined, done: true }
        }

        if (pushQueue.length > 0) {
          return { value: pushQueue.shift(), done: false }
        }

        return new Promise((resolve) => {
          pullQueue.push(resolve)
        })
      },

      async return() {
        emptyQueue()
        return { value: undefined, done: true }
      },

      async throw(error: any) {
        emptyQueue()
        throw error
      },

      [Symbol.asyncIterator]() {
        return this
      }
    }
  }
}

export const pubsub = new SimplePubSub()
