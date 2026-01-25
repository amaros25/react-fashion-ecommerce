const { Client } = require('pg');

const pgClient = new Client({
    user: 'astra',
    host: 'localhost',
    database: 'my_shop',
    password: 'monia2010',
    port: 5432,
});

async function initDbListener(io) {
    try {
        await pgClient.connect();
        console.log('✅ Postgres Listener: Verbindung zur DB hergestellt (astra)');

        await pgClient.query('LISTEN stats_update');

        pgClient.on('notification', (msg) => {
            if (msg.channel === 'stats_update') {
                const payload = JSON.parse(msg.payload);
                const reason = payload.trigger_reason;
                if (reason === 'status_change') {
                    payload.toastMessage = "st";
                    io.to(`user_${payload.userId}`).emit('stats_update', payload);
                    return;
                }
                if (reason === 'new_message') {
                    payload.toastMessage = "nm";
                    io.to(`user_${payload.userId}`).emit('stats_update', payload);
                    return;
                }
                if (reason === 'order_stat_upd') {
                    payload.toastMessage = "od";
                    io.to(`user_${payload.userId}`).emit('stats_update', payload);
                    io.to(`user_${payload.sellerId}`).emit('stats_update', payload);
                    return;
                }
            }
        });
        pgClient.on('error', (err) => {
            console.error('❌ DB Listener Fehler:', err);
        });

    } catch (err) {
        console.error('❌ Fehler beim Starten des Postgres Listeners:', err.message);
    }
}

module.exports = initDbListener;