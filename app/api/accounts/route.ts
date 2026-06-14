import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

export async function GET() {
  const filePath = path.join(process.cwd(), 'DataSet.csv');
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "DataSet.csv not found" }, { status: 404 });
  }

  const accounts: any[] = [];
  
  const typologies = [
    "Structuring / Smurfing", 
    "Dormancy break", 
    "Peer deviation", 
    "Pass-through / Funnel", 
    "Rapid outbound flow", 
    "Crypto conversion", 
    "Offshore transfer"
  ];

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let rowCount = 0;
  
  for await (const line of rl) {
    if (rowCount === 0) {
      rowCount++;
      continue; // skip header
    }
    
    // Load all rows as requested (removed 200 row limit)
    // Warning: This will process all 9,000+ rows which may take a few seconds

    // Split strictly by comma
    const columns = line.split(',');

    if (columns.length < 3924) continue;

    const targetVal = parseFloat(columns[3924]);
    const isTarget = !isNaN(targetVal) && targetVal === 1;
    
    // Deterministically generate ML score based on the target row value
    const baseScore = isTarget ? 80 + (rowCount % 20) : 10 + (rowCount % 65);
    
    // Extract real data (indices verified previously)
    const accountType = columns[3886]?.replace(/"/g, '') || "Unknown";
    const dateOpened = columns[3888]?.replace(/"/g, '') || "Unknown";
    const regionRaw = columns[3890]?.replace(/"/g, '') || "Unknown";
    const region = regionRaw === "U" ? "Urban" : regionRaw === "R" ? "Rural" : regionRaw;
    const occupation = columns[3891]?.replace(/"/g, '') || "Unknown";
    const gender = columns[3892]?.replace(/"/g, '') || "U";
    const segment = columns[3893]?.replace(/"/g, '') || "Retail";
    const age = columns[3894]?.replace(/"/g, '') || "0";

    const exposureVal = parseFloat(columns[1]) || (rowCount % 50);
    const exposure = baseScore < 70 ? `₹${exposureVal.toFixed(1)}L` : `₹${(exposureVal/3).toFixed(1)}Cr`;

    accounts.push({
      id: `AC-DB-${100000 + rowCount}`,
      customer: `Entity-${rowCount}`,
      score: baseScore,
      typology: typologies[rowCount % typologies.length],
      exposure: exposure,
      ring: isTarget ? `#${(rowCount % 15) + 1}` : "None",
      accountType: accountType,
      dateOpened: dateOpened,
      region: region,
      occupation: occupation.charAt(0).toUpperCase() + occupation.slice(1),
      gender: gender,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      age: age,
      rawFeatures: columns // Including all 3,925 columns as requested
    });

    rowCount++;
  }

  // Sort critical items to the top
  accounts.sort((a, b) => b.score - a.score);

  return NextResponse.json(accounts);
}
