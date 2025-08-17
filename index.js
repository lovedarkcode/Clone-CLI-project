#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import express from 'express';
import mime from 'mime-types';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebsiteCloner {
  constructor(baseUrl, outputDir) {
    this.baseUrl = new URL(baseUrl);
    this.outputDir = outputDir;
    this.downloadedFiles = new Set();
    this.downloadQueue = [];
    this.maxConcurrent = 5;
    this.activeDownloads = 0;
  }

  async clone() {
    console.log(chalk.blue(`🚀 Starting to clone: ${this.baseUrl.href}`));
    console.log(chalk.blue(`📁 Output directory: ${this.outputDir}`));

    // Create output directory
    await fs.ensureDir(this.outputDir);

    // Download the main page
    await this.downloadPage(this.baseUrl.href, 'index.html');

    // Process download queue
    await this.processDownloadQueue();

    console.log(chalk.green(`✅ Website cloning completed!`));
    console.log(chalk.yellow(`📁 Files saved to: ${path.resolve(this.outputDir)}`));
  }

  async downloadPage(url, filename) {
    try {
      console.log(chalk.cyan(`📄 Downloading page: ${url}`));
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Process and download assets
      await this.processAssets($, url);
      
      // Rewrite links for offline usage
      this.rewriteLinks($, url);
      
      // Save the processed HTML
      const filePath = path.join(this.outputDir, filename);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, $.html());
      
      this.downloadedFiles.add(url);
      
    } catch (error) {
      console.log(chalk.red(`❌ Error downloading ${url}: ${error.message}`));
    }
  }

  async processAssets($, pageUrl) {
    const basePageUrl = new URL(pageUrl);
    const assets = [];

    // Find all assets
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) assets.push({ type: 'css', url: href, element: el });
    });

    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.push({ type: 'js', url: src, element: el });
    });

    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.push({ type: 'img', url: src, element: el });
    });

    $('img[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        urls.forEach(url => {
          if (url) assets.push({ type: 'img', url: url, element: el });
        });
      }
    });

    // Download assets
    for (const asset of assets) {
      try {
        const assetUrl = new URL(asset.url, basePageUrl);
        const localPath = this.getLocalPath(assetUrl);
        
        // Add to download queue if not already downloaded
        if (!this.downloadedFiles.has(assetUrl.href)) {
          this.downloadQueue.push({
            url: assetUrl.href,
            localPath: localPath,
            type: asset.type
          });
        }

        // Update the element with local path
        this.updateAssetReference($, asset, localPath);
        
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Invalid asset URL: ${asset.url}`));
      }
    }
  }

  updateAssetReference($, asset, localPath) {
    const relativePath = './' + localPath;
    
    if (asset.type === 'css') {
      $(asset.element).attr('href', relativePath);
    } else if (asset.type === 'js') {
      $(asset.element).attr('src', relativePath);
    } else if (asset.type === 'img') {
      $(asset.element).attr('src', relativePath);
    }
  }

  rewriteLinks($, pageUrl) {
    const basePageUrl = new URL(pageUrl);
    
    // Rewrite internal links
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          const linkUrl = new URL(href, basePageUrl);
          if (linkUrl.origin === this.baseUrl.origin) {
            // Internal link - convert to local
            const localPath = this.getLocalPath(linkUrl);
            $(el).attr('href', './' + localPath);
          }
        } catch (error) {
          // Invalid URL, leave as is
        }
      }
    });
  }

  getLocalPath(url) {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // Remove leading slash
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }
    
    // If it's just a directory or empty, add index.html
    if (pathname === '' || pathname.endsWith('/')) {
      pathname += 'index.html';
    }
    
    // If no extension, add .html
    if (!path.extname(pathname)) {
      pathname += '.html';
    }
    
    return pathname;
  }

  async processDownloadQueue() {
    while (this.downloadQueue.length > 0 || this.activeDownloads > 0) {
      if (this.downloadQueue.length > 0 && this.activeDownloads < this.maxConcurrent) {
        const item = this.downloadQueue.shift();
        this.activeDownloads++;
        
        this.downloadAsset(item).finally(() => {
          this.activeDownloads--;
        });
      } else {
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async downloadAsset(item) {
    try {
      if (this.downloadedFiles.has(item.url)) {
        return;
      }

      console.log(chalk.gray(`📦 Downloading: ${item.url}`));
      
      const response = await axios.get(item.url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const filePath = path.join(this.outputDir, item.localPath);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, response.data);
      
      this.downloadedFiles.add(item.url);
      
      // If it's a CSS file, process it for additional assets
      if (item.type === 'css') {
        await this.processCSSFile(filePath, item.url);
      }
      
    } catch (error) {
      console.log(chalk.red(`❌ Error downloading ${item.url}: ${error.message}`));
    }
  }

  async processCSSFile(filePath, cssUrl) {
    try {
      const cssContent = await fs.readFile(filePath, 'utf8');
      const cssBaseUrl = new URL(cssUrl);
      
      // Find URL references in CSS
      const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/g;
      let match;
      let updatedCSS = cssContent;
      
      while ((match = urlRegex.exec(cssContent)) !== null) {
        const assetUrl = match[1];
        
        try {
          const fullAssetUrl = new URL(assetUrl, cssBaseUrl);
          const localPath = this.getLocalPath(fullAssetUrl);
          
          // Add to download queue if not already downloaded
          if (!this.downloadedFiles.has(fullAssetUrl.href)) {
            this.downloadQueue.push({
              url: fullAssetUrl.href,
              localPath: localPath,
              type: 'asset'
            });
          }
          
          // Update CSS with local path
          const relativePath = path.relative(path.dirname(filePath), path.join(this.outputDir, localPath));
          updatedCSS = updatedCSS.replace(match[0], `url("${relativePath.replace(/\\/g, '/')}")`);
          
        } catch (error) {
          // Invalid URL in CSS, leave as is
        }
      }
      
      // Write updated CSS
      await fs.writeFile(filePath, updatedCSS);
      
    } catch (error) {
      console.log(chalk.red(`❌ Error processing CSS file ${filePath}: ${error.message}`));
    }
  }
}

async function serveWebsite(directory, port = 3000) {
  const app = express();
  
  // Serve static files
  app.use(express.static(directory));
  
  // Handle all routes by serving index.html (for SPAs)
  app.get('*', (req, res) => {
    const filePath = path.join(directory, req.path);
    
    fs.access(filePath)
      .then(() => {
        const mimeType = mime.lookup(filePath) || 'text/html';
        res.type(mimeType);
        res.sendFile(path.resolve(filePath));
      })
      .catch(() => {
        // If file doesn't exist, try serving index.html
        const indexPath = path.join(directory, 'index.html');
        res.sendFile(path.resolve(indexPath));
      });
  });
  
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(chalk.green(`🌐 Local server running at: http://localhost:${port}`));
      console.log(chalk.yellow(`📁 Serving from: ${path.resolve(directory)}`));
      console.log(chalk.gray('Press Ctrl+C to stop the server'));
      resolve(server);
    });
  });
}

// CLI setup
const program = new Command();

program
  .name('clone-cli')
  .description('CLI tool to clone websites for offline viewing')
  .version('1.0.0');

program
  .command('clone')
  .description('Clone a website for offline viewing')
  .argument('<url>', 'Website URL to clone')
  .option('-o, --output <directory>', 'Output directory', './cloned-site')
  .action(async (url, options) => {
    try {
      const cloner = new WebsiteCloner(url, options.output);
      await cloner.clone();
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Serve a cloned website locally')
  .argument('<directory>', 'Directory containing the cloned website')
  .option('-p, --port <port>', 'Port to serve on', '3000')
  .action(async (directory, options) => {
    try {
      const port = parseInt(options.port);
      await serveWebsite(directory, port);
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
