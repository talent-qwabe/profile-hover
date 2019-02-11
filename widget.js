import { getProfile, getProfiles, getVerifiedAccounts} from '3box/lib/api'
import { baseTemplate, loadingTemplate, emptyProfileTemplate } from './html.js'

import style from './style.less';
const css = style.toString()

//Utils
const getShortAddress = (address) => {
   return address.substr(0,6) + '...' + address.substr(-4);
}

const copyAddress = (address) => {
  const el = document.createElement('textarea');
  el.value = address
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);

  const icon = document.getElementById(address.substring(2,6))
  copyToCheck(icon)

  setTimeout(checkToCopy, 2000);
}

// For these funcs, mayb swap entire icon element instead
const copyToCheck = (icon) => {
  icon.classList.remove('far')
  icon.classList.remove('fa-clone')
  icon.classList.add('fas')
  icon.classList.add('fa-check')
}

const checkToCopy = (icon) => {
  icon.classList.remove('fas')
  icon.classList.remove('fa-check')
  icon.classList.add('far')
  icon.classList.add('fa-clone')
}

 // Plugin

const injectCSS = () => {
  const sheet = document.createElement('style')
  sheet.type = 'text/css';
  sheet.appendChild(document.createTextNode(css));
  document.body.appendChild(sheet);
}

const initPlugins = () => {
  const buttonArray = document.getElementsByTagName("box:address")
  for (let i = 0; i < buttonArray.length; i++) {
    let { address, display, theme } = buttonArray[i].dataset
    theme = !(theme === 'none')
    const displayShort = !(display === 'full')
    const addressDisplay = displayShort ? getShortAddress(address) : address
    const html = theme ? undefined : buttonArray[i].innerHTML
    buttonArray[i].innerHTML = loadingTemplate({address, addressDisplay: addressDisplay.toLowerCase()}, {html})
  }
}

const loadPluginData = async () => {
  const buttonArray = document.getElementsByTagName("box:address")
  for (let i = 0; i < buttonArray.length; i++) {
    // get addresss, maybe do map instead, add other options here after
    let { address, display, theme } = buttonArray[i].dataset
    theme = !(theme === 'none')
    const displayShort = !(display === 'full')
    const addressDisplay = displayShort ? getShortAddress(address) : address
    const profile = await getProfile(address)
    if (profile.status === 'error') {
        buttonArray[i].innerHTML = emptyProfileTemplate({ address: address, addressDisplay: addressDisplay.toLowerCase()})
    } else {
      const verified = await getVerifiedAccounts(profile)
      console.log(verified)
      console.log(profile)
      const imgSrc = (hash) => `https://ipfs.infura.io/ipfs/${hash}`
      const data = {
        imgSrc: imgSrc(profile.image[0].contentUrl['/']),
        address: address,
        addressDisplay: addressDisplay.toLowerCase(),
        github: verified.github ? verified.github.username : undefined,
        twitter: verified.twitter ? verified.twitter.username : undefined,
        emoji: profile.emoji,
        name: profile.name,
        website: profile.website
      }
      const html = theme ? undefined : buttonArray[i].querySelector("#orginal_html_f1kx").innerHTML
      buttonArray[i].innerHTML = baseTemplate(data, {html})
    }
  }
}

const createPlugins = () => {
  injectCSS()

  window['boxCopyAddress_f1kx'] = copyAddress

  document.addEventListener("DOMContentLoaded", function(event) {
    initPlugins()
  })

  window.addEventListener('load', async () => {
    loadPluginData()
  })
}

createPlugins()
