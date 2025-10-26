// Fix dla lockdown issue w AppKit 1.8.10
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

console.log('🚀 Inicjalizacja AppKit 1.8.10 - bituzin')

const projectId = 'c12e4a814a2dd9dcb0dd714c65a86c62'

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

console.log('✅ AppKit 1.8.10 gotowy!')

// Poczekaj na załadowanie DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

function initApp() {
  console.log('📱 Inicjalizacja interfejsu...')
  
  const walletInfoEl = document.getElementById('wallet-info')
  const addressEl = document.getElementById('address')
  const networkEl = document.getElementById('network')
  const chainIdEl = document.getElementById('chain-id')
  const balanceEl = document.getElementById('balance')
  const connectBtn = document.getElementById('connect-btn')

  function updateUI(address, chainId) {
    if (address) {
      console.log('✅ Połączono:', address)
      walletInfoEl.style.display = 'block'
      
      addressEl.textContent = address
      chainIdEl.textContent = chainId
      
      const networkNames = {
        8453: 'Base'
      }
      networkEl.textContent = networkNames[chainId] || `Chain ${chainId}`
      
      getBalance(address)
    } else {
      console.log('⚪ Rozłączono')
      walletInfoEl.style.display = 'none'
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
        balanceEl.textContent = `${ethBalance.toFixed(6)} ETH`
        console.log('💰 Balans:', ethBalance.toFixed(6), 'ETH')
      } else {
        balanceEl.textContent = 'N/A'
      }
    } catch (error) {
      console.error('❌ Błąd balansu:', error)
      balanceEl.textContent = 'Błąd'
    }
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      console.log('🔌 Otwieranie Connect Modal...')
      modal.open()
    })
  }

  modal.subscribeState((state) => {
    console.log('📊 State:', state)
    if (state.address && state.chainId) {
      updateUI(state.address, state.chainId)
    } else {
      updateUI(null, null)
    }
  })

  console.log('✅ bituzin - AppKit 1.8.10 gotowy!')
}