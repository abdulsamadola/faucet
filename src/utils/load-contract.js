import contract from '@truffle/contract'

export const loadContract = async (name, provider) => {
  const res = await fetch(`/contracts/${name}.json`)
  const Artifact = await res.json()

  const _contract = contract(Artifact)
  _contract.setProvider(provider)

  let instance = null
  try {
    instance = await _contract.deployed()
  } catch (err) {
    console.error('you are connected to wrong network')
  }
  return instance
}
