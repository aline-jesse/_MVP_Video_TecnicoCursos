const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Simulate render progress updates
  let progress = 0;
  const jobId = 'test-job-' + Date.now();
  
  const interval = setInterval(() => {
    progress += 10;
    
    // Send render progress update
    ws.send(JSON.stringify({
      type: 'render_progress',
      data: {
        jobId: jobId,
        progress: progress,
        status: progress < 100 ? 'processing' : 'completed'
      }
    }));
    
    console.log(`Sent progress update: ${progress}%`);
    
    if (progress >= 100) {
      clearInterval(interval);
      
      // Send completion notification
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'system_notification',
          data: {
            type: 'success',
            title: 'Render Completed',
            message: `Job ${jobId} completed successfully!`,
            timestamp: new Date().toISOString()
          }
        }));
        
        console.log('Sent completion notification');
        
        // Close connection after a delay
        setTimeout(() => {
          ws.close();
        }, 2000);
      }, 1000);
    }
  }, 2000); // Update every 2 seconds
});

ws.on('message', function message(data) {
  console.log('Received:', data.toString());
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});