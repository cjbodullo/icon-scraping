const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeUncodeIcons() {
    const url = 'https://undsgn.com/uncode-icons/';
    
    try {
        console.log('Fetching icons from:', url);
        
        // Fetch the webpage
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            throw new Error(`Failed to fetch page: ${response.status}`);
        }
        
        // Load HTML into Cheerio
        const $ = cheerio.load(response.data);
        
        // Method 1: Direct text extraction (for this specific page structure)
        const textContent = response.data;
        const lines = textContent.split('\n');
        
        // Filter lines that start with fa-
        const icons = lines
            .map(line => line.trim())
            .filter(line => line.startsWith('fa-'));
        
        // Remove duplicates
        const uniqueIcons = [...new Set(icons)];
        
        // Method 2: Alternative approach using Cheerio selectors
        if (uniqueIcons.length === 0) {
            console.log('Trying alternative parsing method...');
            
            // Get all text from body and split by lines
            const bodyText = $('body').text();
            const bodyLines = bodyText.split('\n');
            
            const altIcons = bodyLines
                .map(line => line.trim())
                .filter(line => line.startsWith('fa-'));
            
            return [...new Set(altIcons)];
        }
        
        return uniqueIcons;
        
    } catch (error) {
        console.error('Error scraping icons:', error.message);
        return [];
    }
}

function saveIconsToFile(icons, filename = 'uncode-icons.txt') {
    try {
        const content = icons.join('\n');
        fs.writeFileSync(filename, content, 'utf8');
        console.log(`✓ Saved ${icons.length} icons to ${filename}`);
    } catch (error) {
        console.error('Error saving to file:', error.message);
    }
}

function saveIconsAsJSON(icons, filename = 'uncode-icons.json') {
    try {
        const data = {
            fontName: 'uncodeicon',
            totalGlyphs: icons.length,
            icons: icons
        };
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✓ Saved as JSON to ${filename}`);
    } catch (error) {
        console.error('Error saving JSON:', error.message);
    }
}

async function main() {
    console.log('========== Uncode Icons Scraper ==========\n');
    
    const icons = await scrapeUncodeIcons();
    
    if (icons.length > 0) {
        console.log(`\n✅ Successfully extracted ${icons.length} icons\n`);
        
        // Display first 20 icons
        console.log('First 20 icons:');
        icons.slice(0, 20).forEach((icon, index) => {
            console.log(`  ${(index + 1).toString().padStart(2)}. ${icon}`);
        });
        
        if (icons.length > 20) {
            console.log(`  ... and ${icons.length - 20} more`);
        }
        
        // Save to files
        saveIconsToFile(icons);
        saveIconsToFile(icons.sort(), 'uncode-icons-sort.txt');
        //saveIconsAsJSON(icons);
        
        // Additional statistics
        console.log('\n========== Statistics ==========');
        console.log(`Total icons: ${icons.length}`);
        console.log(`Expected (from page header): 1444`);
        console.log(`Difference: ${icons.length - 1444}`);
        
        // Check for completeness
        if (icons.length < 1444) {
            console.log('\n⚠️  Note: Some icons might be missing from the scrape.');
            console.log('The page structure might have changed or icons are loaded dynamically.');
        }
        
        // Show some random samples
        console.log('\nRandom sample of icons:');
        const sampleSize = Math.min(5, icons.length);
        const randomIndices = [];
        while (randomIndices.length < sampleSize) {
            const rand = Math.floor(Math.random() * icons.length);
            if (!randomIndices.includes(rand)) {
                randomIndices.push(rand);
            }
        }
        
        randomIndices.forEach(index => {
            console.log(`  • ${icons[index]}`);
        });
        
    } else {
        console.log('❌ No icons found. The page structure may have changed.');
    }
    
    console.log('\n========== Process Complete ==========');
}

// Installation and usage instructions
function showInstructions() {
    console.log(`
📦 Installation:
1. Make sure you have Node.js installed
2. Install dependencies:
   npm install axios cheerio

🚀 Usage:
1. Save this script as "scrape.js"
2. Run: node scrape.js

📁 Output files:
   - uncode-icons.txt   (plain text list)
   - uncode-icons-sort.txt   (plain text list)
   - uncode-icons.json  (structured JSON)
    `);
}

// Check if dependencies are installed
try {
    require('axios');
    require('cheerio');
    
    // Run the main function
    if (require.main === module) {
        main();
    }
} catch (error) {
    console.error('❌ Missing dependencies!');
    showInstructions();
}