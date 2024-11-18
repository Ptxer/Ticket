// FILE: pages/api/report/pillrecord.js

import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      });

      const [rows] = await connection.execute(`
        SELECT p.pill_name, SUM(pr.quantity) as total_quantity
        FROM pillrecord pr
        JOIN pillstock ps ON pr.pillstock_id = ps.pillstock_id
        JOIN pill p ON ps.pill_id = p.pill_id
        GROUP BY p.pill_name
      `);

      await connection.end();

      res.status(200).json({ data: rows });
    } catch (error) {
      console.error('Error fetching pill records:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}