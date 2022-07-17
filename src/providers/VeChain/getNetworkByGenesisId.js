export default function getNetworkByGenesisId (id) {
  const NETWORK_IDS = {
    '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': 'main',
    '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': 'test'
  }
  return NETWORK_IDS[id] || 'local'
}
