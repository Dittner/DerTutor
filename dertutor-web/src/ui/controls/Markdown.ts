import { div, TextProps } from "flinker-dom"
import { md, MDGrammar, MDLineGrammarRule, MDParser } from "flinker-markdown"

interface MarkdownProps extends TextProps {
  absolutePathPrefix?: string
  mark?: string
  mode: 'md' | 'rawText' | 'rawHtml'
}

const g = new MDGrammar()
const ruParagraph = new MDLineGrammarRule()
ruParagraph.matcher = [/^~ (.*)$/, '<p class="md-ru">$1</p>']
ruParagraph.childrenInlineRules = g.globalRule.childrenInlineRules
ruParagraph.preProccessing = g.defLinePreproccessing

g.globalRule.childrenLineRules.unshift(ruParagraph)
g.quoteMultiline.childrenLineRules.unshift(ruParagraph)
g.ol.childrenLineRules.unshift(ruParagraph)
g.ul.childrenLineRules.unshift(ruParagraph)
g.div.childrenLineRules.unshift(ruParagraph)

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