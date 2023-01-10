import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'

import './App.css'
import { loadContract } from './utils/load-contract'

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null,
  })
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [shouldReload, reload] = useState(false)

  const canConnectToWallet = account && web3Api.contract
  const reloadPage = useCallback(() => reload(!shouldReload), [shouldReload])

  const setAccountListener = (provider) => {
    provider.on('accountsChanged', (_) => window.location.reload())
    provider.on('chainChanged', (_) => window.location.reload())

    // provider._jsonRpcConnection.on('notification', (payload) => {
    //   const { method } = payload

    //   if (method === 'metamask_unlockStateChanged') {
    //     setAccount(null)
    //   }
    // })
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      const contract = await loadContract('Faucet', provider)

      if (provider) {
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          isProviderLoaded: true,
          provider,
          contract,
        })
      } else {
        setWeb3Api((api) => ({
          ...api,
          isProviderLoaded: true,
        }))
        console.log('Please install MetaMask!')
      }
    }
    loadProvider()
  }, [])

  useEffect(() => {
    const getBalance = async () => {
      const { web3, contract } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, 'ether'))
    }
    web3Api.web3 && getBalance()
  }, [web3Api, shouldReload])

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccounts()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { web3, contract } = web3Api
    const accounts = await web3.eth.getAccounts()
    const amount = web3.utils.toWei('1', 'ether')
    await contract.addFunds({ from: accounts[0], value: amount })
    reloadPage()
  }, [web3Api, reloadPage])

  const withdraw = useCallback(async () => {
    const { web3, contract } = web3Api
    const accounts = await web3.eth.getAccounts()
    const amount = web3.utils.toWei('0.1', 'ether')
    await contract.withdraw(amount, { from: accounts[0] })
    reloadPage()
  }, [web3Api, reloadPage])

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2">Account:</strong>
              </span>
              {account ? (
                <div>{account}</div>
              ) : !web3Api.provider ? (
                <div className="notification is-warning is-small is-rounded">
                  Wallet not connected! Please install{' '}
                  <a
                    href="https://metamask.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MetaMask
                  </a>
                </div>
              ) : (
                <button
                  className="button is-small is-info"
                  onClick={() => {
                    web3Api.provider.request({
                      method: 'eth_requestAccounts',
                    })
                  }}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          ) : (
            <span>Looking for Web3...</span>
          )}
          <div className="balance-view is-size-2 my-6">
            Current Balance: <strong>{balance}</strong>ETH
          </div>

          {!canConnectToWallet && (
            <div className="notification is-warning is-small is-rounded">
              Please connect to Ganache to donate or withdraw
            </div>
          )}

          <button
            disabled={!canConnectToWallet}
            className="button is-primary mr-2"
            onClick={addFunds}
          >
            Donate 1 eth
          </button>
          <button
            disabled={!canConnectToWallet}
            className="button is-link"
            onClick={withdraw}
          >
            Withdraw 0.1 eth
          </button>
        </div>
      </div>
    </>
  )
}

export default App
