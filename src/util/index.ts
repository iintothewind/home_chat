// eslint-disable-next-line
const urlRegex: RegExp = /[a-zA-z]+:\/\/[^\s]*/
// eslint-disable-next-line
const imageUrlRegex: RegExp = /[a-zA-z]+:\/\/[^\s]*(.jpg|.png|.gif|.webp)/

const isJsonString = (json: string) => {
  try {
    if (typeof JSON.parse(json) == "object") {
      return true;
    }
  } catch (e) {
    // empty
  }
  return false;
}

const replacements: { name: string, regex: RegExp, replace: string }[] = [
  { name: 'asterisks', regex: /\*/g, replace: '\\*' },
  { name: 'dash', regex: /#/g, replace: '\\#' },
  { name: 'slashes', regex: /\//g, replace: '\\/' },
  { name: 'parentheses', regex: /\(/g, replace: '\\(' },
  { name: 'parentheses', regex: /\)/g, replace: '\\)' },
  { name: 'square brackets', regex: /\[/g, replace: '\\[' },
  { name: 'square brackets', regex: /\]/g, replace: '\\]' },
  { name: 'angle brackets', regex: /</g, replace: '&lt;' },
  { name: 'angle brackets', regex: />/g, replace: '&gt;' },
  { name: 'underscores', regex: /_/g, replace: '\\_' },
]

const escapeMarkDown = (text: string, skips?: string[]) => {
  const _skips = skips || []
  return replacements.reduce(function (text, replacement) {
    const name = replacement.name
    return name && _skips.indexOf(name) !== -1
      ? text
      : text.replace(replacement.regex, replacement.replace)
  }, text)
}


const makePlainText = (text: string) => {
  return text
}

const makeImage = (text: string) => {
  return text && imageUrlRegex.test(text) ? `![](${text})` : text
}

const makeLink = (text: string) => {
  return text && urlRegex.test(text) ? `[](${text})` : text
}

const makeCode = (text: string) => {
  return text ? `\`\`\`\n${text}\n\`\`\`` : text
}


const makeBold = (text: string) => {
  return escapeMarkDown(text) ? `**${text}**` : text
}

export { urlRegex, imageUrlRegex, isJsonString, escapeMarkDown, makePlainText, makeImage, makeLink, makeCode, makeBold }