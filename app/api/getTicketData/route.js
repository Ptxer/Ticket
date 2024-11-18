import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows] = await db.execute(
      `SELECT HOUR(datetime) as hour, COUNT(*) as ticket_count
       FROM ticket
       WHERE datetime BETWEEN '2024-10-19 05:00:00' AND '2024-10-19 19:00:00'
       GROUP BY HOUR(datetime)`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching ticket data" });
  } finally {
    db.end();
  }
}