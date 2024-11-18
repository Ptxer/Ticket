// pages/api/medicine/pill.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [pills] = await connection.query(`
      SELECT p.pill_id, p.pill_name, p.dose, pt.type_name, p.status, u.unit_type
      FROM pill p
      JOIN pill_type pt ON p.type_id = pt.type_id
      JOIN unit u ON p.unit_id = u.unit_id
      ORDER BY p.pill_id ASC
    `);

    return NextResponse.json(pills);
  } catch (error) {
    console.error('Error fetching pills:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return GET(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}