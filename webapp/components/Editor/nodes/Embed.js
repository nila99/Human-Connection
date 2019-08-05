import { Node } from 'tiptap'
import pasteRule from '../commands/pasteRule'
import { compileToFunctions } from 'vue-template-compiler'

const template = `
  <a class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
    <div v-if="embedHtml" v-html="embedHtml" />
    <em> {{ dataEmbedUrl }} </em>
  </a>
`
const compiledTemplate = compileToFunctions(template)

export default class Embed extends Node {
  get name() {
    return 'embed'
  }

  get defaultOptions() {
    return {
      onEmbed: () => ({}),
    }
  }

  pasteRules({ type, schema }) {
    return [
      pasteRule(
        // source: https://stackoverflow.com/a/3809435
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
        type,
        url => ({ dataEmbedUrl: url }),
      ),
    ]
  }

  get schema() {
    return {
      attrs: {
        dataEmbedUrl: {
          default: null,
        },
      },
      group: 'inline',
      inline: true,
      parseDOM: [
        {
          tag: 'a[href].embed',
          getAttrs: dom => ({
            dataEmbedUrl: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          href: node.attrs.dataEmbedUrl,
          class: 'embed',
          target: '_blank',
        },
      ],
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'options'],
      data: () => ({
        embedData: {},
      }),
      async created() {
        if (!this.options) return {}
        this.embedData = await this.options.onEmbed({ url: this.dataEmbedUrl })
      },
      computed: {
        embedClass() {
          return this.embedHtml ? 'embed' : ''
        },
        embedHtml() {
          const { html = '' } = this.embedData
          return html
        },
        dataEmbedUrl: {
          get() {
            return this.node.attrs.dataEmbedUrl
          },
          set(dataEmbedUrl) {
            this.updateAttrs({
              dataEmbedUrl,
            })
          },
        },
      },
      render(createElement) {
        return compiledTemplate.render.call(this, createElement)
      },
    }
  }
}
