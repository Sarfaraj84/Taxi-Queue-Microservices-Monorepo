const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class FileUtils {
  static async ensureDirectories(basePath, directories) {
    try {
      for (const dir of directories) {
        const fullPath = path.join(basePath, dir);
        await fs.ensureDir(fullPath);
        console.log(chalk.green(`✓ Created directory: ${dir}`));
      }
    } catch (error) {
      throw new Error(`Failed to create directories: ${error.message}`);
    }
  }

  static async createFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
      console.log(
        chalk.green(`✓ Created file: ${path.relative(process.cwd(), filePath)}`)
      );
    } catch (error) {
      throw new Error(`Failed to create file ${filePath}: ${error.message}`);
    }
  }

  static async copyTemplateFiles(sourceDir, targetDir) {
    try {
      if (await fs.pathExists(sourceDir)) {
        await fs.copy(sourceDir, targetDir);
        console.log(chalk.green(`✓ Copied template files to: ${targetDir}`));
      }
    } catch (error) {
      throw new Error(`Failed to copy template files: ${error.message}`);
    }
  }

  static async readJsonFile(filePath) {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
    }
  }

  static async writeJsonFile(filePath, data) {
    try {
      await fs.writeJson(filePath, data, { spaces: 2 });
      console.log(
        chalk.green(
          `✓ Updated JSON file: ${path.relative(process.cwd(), filePath)}`
        )
      );
    } catch (error) {
      throw new Error(
        `Failed to write JSON file ${filePath}: ${error.message}`
      );
    }
  }

  static async fileExists(filePath) {
    try {
      return await fs.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  static async appendToFile(filePath, content) {
    try {
      await fs.appendFile(filePath, content);
      console.log(
        chalk.green(
          `✓ Appended to file: ${path.relative(process.cwd(), filePath)}`
        )
      );
    } catch (error) {
      throw new Error(`Failed to append to file ${filePath}: ${error.message}`);
    }
  }

  static async removeFile(filePath) {
    try {
      await fs.remove(filePath);
      console.log(
        chalk.yellow(
          `✓ Removed file: ${path.relative(process.cwd(), filePath)}`
        )
      );
    } catch (error) {
      throw new Error(`Failed to remove file ${filePath}: ${error.message}`);
    }
  }

  static async listFiles(dirPath, pattern = /.*/) {
    try {
      if (!(await fs.pathExists(dirPath))) {
        return [];
      }
      const files = await fs.readdir(dirPath);
      return files.filter((file) => pattern.test(file));
    } catch (error) {
      throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
    }
  }

  static async createDirectoryIfNotExists(dirPath) {
    try {
      if (!(await fs.pathExists(dirPath))) {
        await fs.ensureDir(dirPath);
        console.log(
          chalk.green(
            `✓ Created directory: ${path.relative(process.cwd(), dirPath)}`
          )
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to create directory ${dirPath}: ${error.message}`
      );
    }
  }
}

module.exports = FileUtils;
