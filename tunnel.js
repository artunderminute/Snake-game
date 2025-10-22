const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 8000 });

  console.log('\n==============================================');
  console.log('Your game is now accessible at:');
  console.log(tunnel.url);
  console.log('==============================================\n');

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
