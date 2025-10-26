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
import { BrowserProvider } from 'ethers'

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
      
      console.log('🔄 Getting wallet provider...')
      const walletProvider = modal.getWalletProvider()
      if (!walletProvider) {
        console.error('❌ No wallet provider found')
        showPopup('❌ No wallet provider found. Please connect wallet first.', 'error')
        return
      }

      console.log('✅ Wallet provider found')
      const ethersProvider = new BrowserProvider(walletProvider)
      const signer = await ethersProvider.getSigner()
      console.log('✅ Signer obtained:', await signer.getAddress())

      console.log('📤 Sending transaction...')
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: 0,
        data: '0xd09de08a'
      })

      console.log('📝 TX Hash:', tx.hash)
      showPopup(`✅ Transaction sent!<br><a href="https://basescan.org/tx/${tx.hash}" target="_blank">View on Basescan</a>`, 'success')

      console.log('⏳ Waiting for confirmation...')
      await tx.wait()
      console.log('✅ Transaction confirmed!')

    } catch (error) {
      console.error('❌ Error:', error)
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        showPopup('❌ Transaction rejected by user', 'error')
      } else {
        showPopup('❌ Error: ' + (error.message || 'Unknown error'), 'error')
      }
    } finally {
      sendHiBtn.disabled = false
      sendHiBtn.textContent = 'Send Hi to Base'
    }
  }

  async function updateWalletInfo() {
    try {
      console.log('🔄 Updating wallet info...')
      const walletProvider = modal.getWalletProvider()
      
      if (!walletProvider) {
        console.log('⚪ No wallet provider - hiding UI')
        walletInfoEl.style.display = 'none'
        sendHiBtn.style.display = 'none'
        return
      }

      console.log('✅ Wallet provider exists')
      const ethersProvider = new BrowserProvider(walletProvider)
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()
      const network = await ethersProvider.getNetwork()
      const chainId = Number(network.chainId)

      console.log('✅ Got wallet info:', { address, chainId })

      // Show UI
      walletInfoEl.style.display = 'block'
      sendHiBtn.style.display = 'inline-block'
      
      // Update address
      addressEl.textContent = address
      chainIdEl.textContent = chainId
      
      // Update network name
      const networkNames = {
        8453: 'Base',
        1: 'Ethereum',
        137: 'Polygon',
        10: 'Optimism',
        42161: 'Arbitrum'
      }
      networkEl.textContent = networkNames[chainId] || 'Chain ' + chainId
      
      // Get balance
      const balance = await ethersProvider.getBalance(address)
      const ethBalance = Number(balance) / 1e18
      balanceEl.textContent = ethBalance.toFixed(6) + ' ETH'
      
      console.log('💰 Balance:', ethBalance.toFixed(6), 'ETH')

    } catch (error) {
      console.error('❌ Error updating wallet info:', error)
      walletInfoEl.style.display = 'none'
      sendHiBtn.style.display = 'none'
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

  // Subscribe to modal events
  modal.subscribeEvents((event) => {
    console.log('🎯 Event:', event)
    
    if (event.data?.event === 'MODAL_CLOSE' || 
        event.data?.event === 'CONNECT_SUCCESS' ||
        event.data?.event === 'DISCONNECT_SUCCESS') {
      console.log('🔄 Relevant event detected, updating UI...')
      setTimeout(updateWalletInfo, 500)
    }
  })

  // Subscribe to state changes
  modal.subscribeState((state) => {
    console.log('📊 State changed:', {
      address: state.address,
      chainId: state.chainId,
      isConnected: state.isConnected,
      status: state.status
    })
    
    // Update UI whenever state changes
    setTimeout(updateWalletInfo, 500)
  })

  // Check on load
  setTimeout(() => {
    console.log('🔍 Initial check...')
    updateWalletInfo()
  }, 1500)

  console.log('✅ bituzin - AppKit 1.8.10 ready!')
}