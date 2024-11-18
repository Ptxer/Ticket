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
          SELECT s.symptom_name, COUNT(sr.patientrecord_id) AS symptom_count
          FROM symptomrecord sr
          JOIN symptom s ON sr.symptom_id = s.symptom_id
          JOIN patientrecord pr ON sr.patientrecord_id = pr.patientrecord_id
          WHERE DATE(pr.datetime) = CURDATE()
          GROUP BY s.symptom_name
          ORDER BY symptom_count DESC;
        `;
        break;
      case 'month':
        query = `
          SELECT s.symptom_name, COUNT(sr.patientrecord_id) AS symptom_count
          FROM symptomrecord sr
          JOIN symptom s ON sr.symptom_id = s.symptom_id
          JOIN patientrecord pr ON sr.patientrecord_id = pr.patientrecord_id
          WHERE MONTH(pr.datetime) = MONTH(CURDATE()) AND YEAR(pr.datetime) = YEAR(CURDATE())
          GROUP BY s.symptom_name
          ORDER BY symptom_count DESC;
        `;
        break;
      case 'year':
        query = `
          SELECT s.symptom_name, COUNT(sr.patientrecord_id) AS symptom_count
          FROM symptomrecord sr
          JOIN symptom s ON sr.symptom_id = s.symptom_id
          JOIN patientrecord pr ON sr.patientrecord_id = pr.patientrecord_id
          WHERE YEAR(pr.datetime) = YEAR(CURDATE())
          GROUP BY s.symptom_name
          ORDER BY symptom_count DESC;
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