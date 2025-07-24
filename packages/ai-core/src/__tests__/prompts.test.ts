/**
 * Prompt Management Tests
 * Testing the prompt loading and template system
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromptLoader } from '../prompts/loader';

// Mock fs module
vi.mock('fs/promises');

describe('PromptLoader', () => {
  const mockPromptContent = `---
title: Test Prompt
description: A test prompt for validation
version: 1.0.0
variables:
  - name: testVar
    description: Test variable
    required: true
---

This is a test prompt with {{testVar}}.`;

  const mockPromptContentES = `---
title: Prompt de Prueba
description: Un prompt de prueba para validación
version: 1.0.0
variables:
  - name: testVar
    description: Variable de prueba
    required: true
---

Este es un prompt de prueba con {{testVar}}.`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadPrompt', () => {
    it('should load and parse prompt file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);

      const result = await PromptLoader.loadPrompt('test', 'basic', 'en');

      expect(result).toContain('This is a test prompt with');
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('test', 'basic.en.md')),
        'utf-8',
      );
    });

    it('should load prompt with variables interpolation', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);

      const result = await PromptLoader.loadPrompt('test', 'basic', 'en', {
        testVar: 'hello world',
      });

      expect(result).toBe('This is a test prompt with hello world.');
    });

    it('should fallback to English for unsupported locale', async () => {
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce(mockPromptContent);

      const result = await PromptLoader.loadPrompt('test', 'basic', 'fr' as any);

      expect(result).toContain('This is a test prompt with');
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should load Spanish prompt when available', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContentES);

      const result = await PromptLoader.loadPrompt('test', 'basic', 'es');

      expect(result).toContain('Este es un prompt de prueba con');
    });

    it('should throw error when prompt file not found', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(
        PromptLoader.loadPrompt('nonexistent', 'basic', 'en'),
      ).rejects.toThrow();
    });
  });

  describe('getPromptMetadata', () => {
    it('should extract metadata from prompt file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);

      const metadata = await PromptLoader.getPromptMetadata('test', 'basic', 'en');

      expect(metadata.title).toBe('Test Prompt');
      expect(metadata.description).toBe('A test prompt for validation');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.variables).toHaveLength(1);
      expect(metadata.variables[0].name).toBe('testVar');
      expect(metadata.variables[0].required).toBe(true);
    });

    it('should handle prompt without metadata', async () => {
      const contentWithoutMetadata = 'Just a simple prompt without frontmatter.';
      vi.mocked(fs.readFile).mockResolvedValue(contentWithoutMetadata);

      const metadata = await PromptLoader.getPromptMetadata('test', 'simple', 'en');

      expect(metadata.title).toBe('simple');
      expect(metadata.variables).toHaveLength(0);
    });
  });

  describe('validateVariables', () => {
    beforeEach(() => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);
    });

    it('should validate required variables are provided', async () => {
      await expect(
        PromptLoader.loadPrompt('test', 'basic', 'en', {}),
      ).rejects.toThrow('Missing required variable: testVar');
    });

    it('should not throw when all required variables are provided', async () => {
      const result = await PromptLoader.loadPrompt('test', 'basic', 'en', {
        testVar: 'value',
      });

      expect(result).toBe('This is a test prompt with value.');
    });
  });

  describe('caching', () => {
    it('should cache loaded prompts', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);

      // Load same prompt twice
      await PromptLoader.loadPrompt('test', 'basic', 'en');
      await PromptLoader.loadPrompt('test', 'basic', 'en');

      // File should only be read once due to caching
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should return fresh content after cache clear', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(mockPromptContent);

      await PromptLoader.loadPrompt('test', 'basic', 'en');
      PromptLoader.clearCache();
      await PromptLoader.loadPrompt('test', 'basic', 'en');

      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('listPrompts', () => {
    it('should list available prompts in category', async () => {
      const mockFiles = ['basic.en.md', 'advanced.en.md', 'basic.es.md'];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);

      const prompts = await PromptLoader.listPrompts('test');

      expect(prompts).toEqual(['basic', 'advanced']);
    });

    it('should handle empty directory', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const prompts = await PromptLoader.listPrompts('empty');

      expect(prompts).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return usage statistics', () => {
      const stats = PromptLoader.getStats();

      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('totalLoads');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
      expect(stats).toHaveProperty('hitRate');
    });
  });
});
