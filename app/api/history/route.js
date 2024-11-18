// import mysql from "mysql2/promise";

// export async function GET(req) {
//   try {
//     const connection = await mysql.createConnection({
//       host: process.env.MYSQL_HOST,
//       user: process.env.MYSQL_USER,
//       password: process.env.MYSQL_PASSWORD,
//       database: process.env.MYSQL_DATABASE,
//     });

//     const [updateResult] = await connection.execute(`
//       UPDATE patientrecord
//       SET status = 0
//       WHERE status = 1
//         AND DATE(datetime) < CURDATE();
//     `);

//     const query = `
//     SELECT 
//       p.patient_name,
//       p.patient_id,
//       pt.patienttype_name,
//       pr.datetime,
//       pr.status,
//       pr.other_symptom,
//       GROUP_CONCAT(DISTINCT s.symptom_name) AS symptom_names,
//       GROUP_CONCAT(DISTINCT pl.pill_name) AS pill_names,
//       GROUP_CONCAT(DISTINCT ps.pillstock_id) AS pillstock_ids,
//       GROUP_CONCAT(DISTINCT prd.quantity) AS pill_quantities
//     FROM patientrecord pr
//     JOIN patient p ON pr.patient_id = p.patient_id
//     JOIN patienttype pt ON p.patienttype_id = pt.patienttype_id
//     LEFT JOIN symptomrecord sr ON pr.patientrecord_id = sr.patientrecord_id
//     LEFT JOIN symptom s ON sr.symptom_id = s.symptom_id
//     LEFT JOIN pillrecord prd ON pr.patientrecord_id = prd.patientrecord_id
//     LEFT JOIN pillstock ps ON prd.pillstock_id = ps.pillstock_id
//     LEFT JOIN pill pl ON ps.pill_id = pl.pill_id
//     GROUP BY pr.patientrecord_id
//   `;
  
//   const [rows] = await connection.execute(query);
  
//   const result = rows.map((row) => ({
//     patientName: row.patient_name,
//     studentId: row.patient_id,
//     patientType: row.patienttype_name,
//     datetime: row.datetime,
//     status: row.status,
//     otherSymptom: row.other_symptom,
//     symptomNames: row.symptom_names ? row.symptom_names.split(",") : [],
//     pillRecords:
//       row.pill_names && row.pillstock_ids && row.pill_quantities
//         ? row.pill_names.split(",").map((pillName, index) => {
//             const pillStockIds = row.pillstock_ids.split(",");
//             const pillQuantities = row.pill_quantities.split(",");
//             return {
//               key: `${row.patient_id}-${pillStockIds[index]}`, // Unique key
//               pillName: pillName.trim(),
//               pillStockId: pillStockIds[index] ? pillStockIds[index].trim() : null,
//               quantity: pillQuantities[index] ? pillQuantities[index].trim() : null,
//             };
//           })
//         : [],
//   }));
  
//   await connection.end();
  
//   return new Response(JSON.stringify(result), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }