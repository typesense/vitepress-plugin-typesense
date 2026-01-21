import * as cheerio from 'cheerio';
import crypto from 'crypto';
import type { DocSearchRecord, Hierarchy, RecordWeight } from './types';

export class IndexingStrategy {
  private levels = ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6'];

  private selectors = {
    lvl0: { selector: '.VPNavBarTitle', global: true },

    lvl1: { selector: '.vp-doc h1', global: false },
    lvl2: { selector: '.vp-doc h2', global: false },
    lvl3: { selector: '.vp-doc h3', global: false },
    lvl4: { selector: '.vp-doc h4', global: false },
    lvl5: { selector: '.vp-doc h5', global: false },
    lvl6: { selector: '.vp-doc h6', global: false },
    content: {
      selector: '.vp-doc p, .vp-doc ul, .vp-doc ol, .vp-doc table',
      global: false,
    },
  };

  public getRecords(
    html: string,
    url: string,
    frontmatter: any,
    lang?: string,
  ): DocSearchRecord[] {
    const $ = cheerio.load(html);
    const records: DocSearchRecord[] = [];

    // Fallback: If no .VPNavBarTitle, use <title> tag
    const globalHierarchy: Partial<Hierarchy> = {
      lvl0:
        frontmatter.title ||
        $('.VPNavBarTitle').text() ||
        $('title').text() ||
        'Documentation',
    };

    // We construct a query that selects all headers and paragraphs inside .vp-doc
    // in the order they appear in the DOM.
    const selectorString = Object.values(this.selectors)
      .filter((s) => !s.global)
      .map((s) => s.selector)
      .join(', ');

    const nodes = $(selectorString);

    let previousHierarchy = this.generateEmptyHierarchy();
    previousHierarchy.lvl0 = globalHierarchy.lvl0 || null;

    const anchors = this.generateEmptyHierarchy();

    nodes.each((index, element) => {
      const el = $(element);
      // @ts-ignore need to install domhandler to import type Element
      const tagName = element.tagName.toLowerCase();
      const currentLevel = this.getLevelFromTag(tagName);

      // Clone hierarchy
      const hierarchy = { ...previousHierarchy };

      // Update Hierarchy
      const currentLevelInt = this.levels.indexOf(currentLevel);

      if (currentLevel !== 'content') {
        const text = this.cleanText(el);

        hierarchy[currentLevel] = text;

        // We grab the ID directly from the Header element.
        anchors[currentLevel] = this.getAnchor(el);

        // Reset deeper levels
        for (let i = currentLevelInt + 1; i < 7; i++) {
          const lvlKey = `lvl${i}`;
          hierarchy[lvlKey] = null;
          anchors[lvlKey] = null;
        }
        previousHierarchy = { ...hierarchy };
      }

      // Content
      let content: string | null = null;
      if (currentLevel === 'content') {
        content = this.cleanText(el);
        if (!content) return;
      }

      if (currentLevel.startsWith('lvl') && !hierarchy[currentLevel]) return;

      // Resolve Anchor
      const resolvedAnchor = this.getClosestAnchor(anchors);

      // Weight
      const levelWeight =
        currentLevel === 'content' ? 0 : 100 - currentLevelInt * 10;

      const weight: RecordWeight = {
        page_rank: frontmatter.order || 0,
        level: levelWeight,
        position: index,
        position_descending: nodes.length - index,
      };

      // Construct Record
      const record: DocSearchRecord = {
        objectID: '',
        url_without_anchor: url,
        // Since we read generated HTML, we have valid IDs, so deep links work.
        url: resolvedAnchor ? `${url}#${resolvedAnchor}` : url,
        anchor: resolvedAnchor,
        content: content,
        hierarchy: hierarchy as Hierarchy,
        hierarchy_radio: this.getHierarchyRadio(
          hierarchy as Hierarchy,
          currentLevel,
        ),
        type: currentLevel,
        weight: weight,
        language: lang,
      };

      record.objectID = this.getObjectID(record);
      records.push(record);
    });

    return records;
  }

  // Helpers

  private getLevelFromTag(tagName: string): string {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return `lvl${tagName.replace('h', '')}`;
    }
    return 'content';
  }

  private generateEmptyHierarchy(): Hierarchy {
    return {
      lvl0: null,
      lvl1: null,
      lvl2: null,
      lvl3: null,
      lvl4: null,
      lvl5: null,
      lvl6: null,
    };
  }

  // Returns hierarchy where only the deepest active level is filled.
  private getHierarchyRadio(
    hierarchy: Hierarchy,
    currentLevel: string,
  ): Hierarchy {
    const radio = this.generateEmptyHierarchy();
    let isFound = false;

    for (let i = 6; i >= 0; i--) {
      const level = `lvl${i}`;
      const value = hierarchy[level];

      if (!isFound && value !== null) {
        if (currentLevel === 'content' || level === currentLevel) {
          radio[level] = value;
          isFound = true;
          continue;
        }
      }
      radio[level] = null;
    }
    return radio;
  }

  // Since we are parsing generated HTML, we simply look for 'id'
  private getAnchor(el: cheerio.Cheerio<any>): string | null {
    const id = el.attr('id');
    return id || null;
  }

  private getClosestAnchor(anchors: Hierarchy): string | null {
    for (let i = 6; i >= 0; i--) {
      const val = anchors[`lvl${i}`];
      if (val) return val;
    }
    return null;
  }

  private getObjectID(record: DocSearchRecord): string {
    const hierarchyToHash: Record<string, string> = {};
    Object.keys(record.hierarchy).forEach((k) => {
      const val = record.hierarchy[k];
      if (val) hierarchyToHash[k] = val;
    });

    const payload = {
      hierarchy: hierarchyToHash,
      url: record.url_without_anchor,
      position: record.weight.position,
    };

    const jsonStr = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha1').update(jsonStr).digest('hex');
  }

  /**
   * Removes anchor links and invisible characters
   */
  private cleanText(el: cheerio.Cheerio<any>): string {
    // Clone the element so we don't destroy the original DOM for other operations
    const clone = el.clone();

    // Remove the header anchor link (<a class="header-anchor">​​</a>)
    clone.find('.header-anchor').remove();

    // Get text
    let text = clone.text();

    // Regex cleaning:
    // \u00A0 : Non-breaking space
    // \u200B : Zero-width space
    // \s+    : Collapse multiple whitespaces into one
    text = text
      .replace(/\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }
}
