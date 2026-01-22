import { div, TextProps } from "flinker-dom"
import { md, MDGrammar, MDLineGrammarRule, MDMultilineGrammarRule, MDParser } from "flinker-markdown"

interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  mark?: string
  mode: 'md' | 'rawText' | 'rawHtml'
}

const g = new MDGrammar()
// ruParagraph
const ruParagraph = new MDLineGrammarRule()
ruParagraph.matcher = [/^~ (.*)$/, '<p class="md-ru">$1</p>']
ruParagraph.childrenInlineRules = g.globalRule.childrenInlineRules
ruParagraph.preProccessing = g.defLinePreproccessing

g.globalRule.childrenLineRules.unshift(ruParagraph)
g.quoteMultiline.childrenLineRules.unshift(ruParagraph)
g.ol.childrenLineRules.unshift(ruParagraph)
g.ul.childrenLineRules.unshift(ruParagraph)
g.div.childrenLineRules.unshift(ruParagraph)

// ruMultiline
const ruMultiline = new MDMultilineGrammarRule()
ruMultiline.startMatcher = [/^~~ *$/, '<div class="md-ru">']
ruMultiline.endMatcher = [/^~~ *$/, '</div>']
ruMultiline.childrenInlineRules = g.globalRule.childrenInlineRules
ruMultiline.childrenLineRules = g.div.childrenLineRules
ruMultiline.childrenMultilineRules = g.div.childrenMultilineRules
g.globalRule.childrenMultilineRules.unshift(ruMultiline)

// noteParagraph
const noteParagraph = new MDLineGrammarRule()
noteParagraph.matcher = [/^\* (.*)$/, '<p class="md-note">$1</p>']
noteParagraph.childrenInlineRules = g.globalRule.childrenInlineRules
noteParagraph.preProccessing = g.defLinePreproccessing

g.globalRule.childrenLineRules.unshift(noteParagraph)
g.quoteMultiline.childrenLineRules.unshift(noteParagraph)
g.ol.childrenLineRules.unshift(noteParagraph)
g.ul.childrenLineRules.unshift(noteParagraph)
g.div.childrenLineRules.unshift(noteParagraph)

// noteMultiline
const noteMultiline = new MDMultilineGrammarRule()
noteMultiline.startMatcher = [/^\*\* *$/, '<div class="md-note">']
noteMultiline.endMatcher = [/^\*\* *$/, '</div>']
noteMultiline.childrenInlineRules = g.globalRule.childrenInlineRules
noteMultiline.childrenLineRules = g.div.childrenLineRules
noteMultiline.childrenMultilineRules = g.div.childrenMultilineRules
g.globalRule.childrenMultilineRules.unshift(noteMultiline)

//g.audio.matcher[1] = g.audio.matcher[1].replace('controls', '')
const parser = new MDParser(g)

export const Markdown = () => {
  return div<MarkdownProps>()
    .map(s => {
      if (s.mode === 'md') {
        s.htmlText = s.text ? md(parser, s.text, s.absolutePathPrefix, s.mark) : ''
        s.text = ''
      } else if (s.mode === 'rawHtml') {
        s.text = s.text ? md(parser, s.text, s.absolutePathPrefix, s.mark) : ''
      }
    })
}