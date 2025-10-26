if (typeof window !== 'undefined') {
  window.LOCKDOWN_OPTIONS = { 
    errorTaming: 'unsafe', 
    stackFiltering: 'verbose',
    overrideTaming: 'severe'
  }
}

import './style.css'
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { base } from '@reown/appkit/networks'

console.log('🚀 Initializing AppKit 1.8.10 - bituzin')

const projectId = 'c12e4a814a2dd9dcb0dd714c65a86c62'
const CONTRACT_ADDRESS = '0x78776b0d6185D97Ca9a9A822bf1E192e3B44307f'

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: 'WCAppKitTest - bituzin',
    description: 'AppKit 1.8.10 Integration by bituzin',
    url: 'https://bituzin.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  features: {
    analytics: true
  }
})

console.log('✅ AppKit 1.8.10 ready!')

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

function initApp() {
  console.log('📱 Initializing interface...')
  
  const walletInfoEl = document.getElementById('wallet-info')
  const addressEl = document.getElementById('address')
  const networkEl = document.getElementById('network')
  const chainIdEl = document.getElementById('chain-id')
  const balanceEl = document.getElementById('balance')
  const connectBtn = document.getElementById('connect-btn')
  const sendHiBtn = document.getElementById('send-hi-btn')

  let isWalletConnected = false

  function showPopup(message, type) {
    const existingPopup = document.getElementById('tx-popup')
    if (existingPopup) {
      existingPopup.remove()
    }

    const popup = document.createElement('div')
    popup.id = 'tx-popup'
    popup.className = 'popup ' + type
    popup.innerHTML = `
      <div class="popup-content">
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `
    document.body.appendChild(popup)

    if (type === 'success') {
      setTimeout(() => {
        popup.remove()
      }, 5000)
    }
  }

  async function sendHiToBase() {
    try {
      sendHiBtn.disabled = true
      sendHiBtn.textContent = 'Sending...'
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: CONTRACT_ADDRESS,
          value: '0x0',
          data: '0xd09de08a'
        }]
      })

      console.log('📝 TX Hash:', txHash)
      showPopup(`✅ Transaction sent!<br><a href="https://basescan.org/tx/${txHash}" target="_blank">View on Basescan</a>`, 'success')

    } catch (error) {
      console.error('❌ Error:', error)
      if (error.code === 4001) {
        showPopup('❌ Transaction rejected by user', 'error')
      } else {
        showPopup('❌ Error: ' + error.message, 'error')
      }
    } finally {
      sendHiBtn.disabled = false
      sendHiBtn.textContent = 'Send Hi to Base'
    }
  }

  function updateUI(address, chainId) {
    if (address) {
      console.log('✅ Connected:', address)
      isWalletConnected = true
      walletInfoEl.style.display = 'block'
      sendHiBtn.style.display = 'inline-block'
      
      addressEl.textContent = address
      chainIdEl.textContent = chainId
      
      const networkNames = {
        8453: 'Base'
      }
      networkEl.textContent = networkNames[chainId] || 'Chain ' + chainId
      
      getBalance(address)
    } else {
      console.log('⚪ Disconnected')
      isWalletConnected = false
      walletInfoEl.style.display = 'none'
      sendHiBtn.style.display = 'none'
    }
  }

  async function getBalance(address) {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        const ethBalance = parseInt(balance, 16) / 1e18
        balanceEl.textContent = ethBalance.toFixed(6) + ' ETH'
        console.log('💰 Balance:', ethBalance.toFixed(6), 'ETH')
      } else {
        balanceEl.textContent = 'N/A'
      }
    } catch (error) {
      console.error('❌ Balance error:', error)
      balanceEl.textContent = 'Error'
    }
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      console.log('🔌 Opening Connect Modal...')
      modal.open()
    })
  }

  if (sendHiBtn) {
    sendHiBtn.addEventListener('click', sendHiToBase)
  }

  modal.subscribeState((state) => {
    console.log('📊 State:', state)
    
    if (state.address && state.chainId) {
      updateUI(state.address, state.chainId)
    } else if (!isWalletConnected) {
      updateUI(null, null)
    }
  })

  if (window.ethereum) {
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) {
        window.ethereum.request({ method: 'eth_chainId' }).then(chain => {
          updateUI(accounts[0], parseInt(chain, 16))
        })
      }
    })

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        window.ethereum.request({ method: 'eth_chainId' }).then(chain => {
          updateUI(accounts[0], parseInt(chain, 16))
        })
      } else {
        updateUI(null, null)
      }
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }

  console.log('✅ bituzin - AppKit 1.8.10 ready!')
}