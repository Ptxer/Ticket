import mysql from 'mysql2/promise';

export async function GET(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/medicine_type') {
        return getTypes();
    } else if (path === '/api/unit_type') {
        return getUnits();
    }

    return getPillStock();
}

async function getPillStock() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const query = `
            SELECT 
                pillstock.pillstock_id, 
                pill.pill_id, 
                pill.pill_name,
                pill.dose, 
                pill_type.type_name,
                pillstock.expire, 
                pillstock.total, 
                unit.unit_id
            FROM pillstock
            JOIN pill ON pillstock.pill_id = pill.pill_id
            JOIN unit ON pillstock.unit_id = unit.unit_id
            JOIN pill_type ON pill.type_id = pill_type.type_id
        `;

        const [results] = await connection.execute(query);

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error executing query:', err);
        return new Response('Server error', { status: 500 });
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
}

async function getTypes() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const query = 'SELECT type_id, type_name FROM pill_type';
        const [results] = await connection.execute(query);

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error executing query:', err);
        return new Response('Server error', { status: 500 });
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
}

async function getUnits() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const query = 'SELECT unit_id, unit_type FROM unit';
        const [results] = await connection.execute(query);

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error executing query:', err);
        return new Response('Server error', { status: 500 });
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
}