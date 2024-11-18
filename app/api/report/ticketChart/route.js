import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(req) {
  const { timePeriod } = await req.json();

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    let query;
    let queryParams = [];

    switch (timePeriod) {
      case 'day':
        query = `
          SELECT HOUR(datetime) AS hour, COUNT(patientrecord_id) AS ticket_count
          FROM patientrecord
          WHERE DATE(datetime) = CURDATE()
          GROUP BY HOUR(datetime)
          ORDER BY hour;
        `;
        break;
      case 'month':
        query = `
          SELECT MONTH(datetime) AS month, COUNT(patientrecord_id) AS ticket_count
          FROM patientrecord
          WHERE YEAR(datetime) = YEAR(CURDATE())
          GROUP BY MONTH(datetime)
          ORDER BY month;
        `;
        break;
      case 'year':
        query = `
          SELECT YEAR(datetime) AS year, COUNT(patientrecord_id) AS ticket_count
          FROM patientrecord
          WHERE YEAR(datetime) BETWEEN YEAR(CURDATE()) - 5 AND YEAR(CURDATE())
          GROUP BY YEAR(datetime)
          ORDER BY year;
        `;
        break;
      default:
        return NextResponse.json({ error: 'Invalid time period' }, { status: 400 });
    }

    const [results] = await connection.query(query, queryParams);

    return NextResponse.json({ data: results });
  } catch (err) {
    console.error('Error fetching data:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}