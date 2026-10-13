#!/usr/bin/env bash
set -euo pipefail

PCAP="${1:-captures/gtpu.pcapng}"

if ! command -v tshark >/dev/null 2>&1; then
  echo "Error: tshark is not installed." >&2
  exit 1
fi

if [[ ! -f "$PCAP" ]]; then
  echo "Error: capture file not found: $PCAP" >&2
  echo "Usage: $0 [path/to/capture.pcapng]" >&2
  exit 1
fi

echo "GTP-U / ICMP Capture Analysis"
echo "Capture: $PCAP"
echo

total=$(tshark -r "$PCAP" -Y 'gtp && icmp' 2>/dev/null | wc -l)
uplink=$(tshark -r "$PCAP" -Y 'gtp && icmp.type == 8' 2>/dev/null | wc -l)
downlink=$(tshark -r "$PCAP" -Y 'gtp && icmp.type == 0' 2>/dev/null | wc -l)

printf 'GTP-U packets carrying ICMP: %s\n' "$total"
printf 'ICMP echo requests:          %s\n' "$uplink"
printf 'ICMP echo replies:           %s\n' "$downlink"
echo

echo "Packet details:"
tshark -r "$PCAP" \
  -Y 'gtp && icmp' \
  -T fields \
  -E header=y \
  -E separator=$'\t' \
  -e frame.number \
  -e ip.src \
  -e ip.dst \
  -e gtp.teid \
  -e icmp.type
