const { MongoClient } = require('mongodb'); 
async function run() { 
  const client = new MongoClient('mongodb+srv://CasalPlanner:CasalPlanner12345678@casalplanner.gyuoqz4.mongodb.net'); 
  await client.connect(); 
  const db = client.db('test'); 
  const res = await db.collection('Usuarios').updateMany({ SlugListaPublica: 'meu-casamento' }, { $set: { SlugListaPublica: '93123' } }); 
  console.log(res); 
  await client.close(); 
} 
run();
