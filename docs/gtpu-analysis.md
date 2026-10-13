# GTP-U Tunnel Analysis

## Objective

Verify user-plane packet forwarding in the local Open5GS and UERANSIM
5G Standalone lab by examining captured GTP-U traffic with TShark.

## Lab topology

- gNB: `172.22.0.23`
- UPF: `172.22.0.8`
- UE tunnel address: `192.168.100.3`
- Test destination: `8.8.8.8`
- GTP-U transport: UDP port `2152`

## Evidence

Capture file: `captures/gtpu.pcapng`

Run the analysis:

```bash
./scripts/analyze-gtpu.sh
```

Observed results:

| Measurement | Result |
|---|---:|
| GTP-U packets carrying ICMP | 16 |
| ICMP echo requests | 8 |
| ICMP echo replies | 8 |

## Packet interpretation

### Uplink

- Outer source: gNB `172.22.0.23`
- Outer destination: UPF `172.22.0.8`
- Inner source: UE `192.168.100.3`
- Inner destination: `8.8.8.8`
- Observed TEID: `0x0000b7f6`
- ICMP type: 8 (Echo Request)

### Downlink

- Outer source: UPF `172.22.0.8`
- Outer destination: gNB `172.22.0.23`
- Inner source: `8.8.8.8`
- Inner destination: UE `192.168.100.3`
- Observed TEID: `0x00000002`
- ICMP type: 0 (Echo Reply)

## Conclusion

The inspected capture contains eight uplink ICMP Echo Requests and eight
downlink ICMP Echo Replies encapsulated in GTP-U. This is evidence of
bidirectional user-plane traffic in the tested lab.

The TEIDs are values observed in this capture; they are not universal
identifiers and may change when sessions are recreated.

## Limitations

This report describes a saved capture, not live monitoring. It does not
measure throughput, latency, packet loss across a statistically meaningful
test, or production-network performance. Review the capture for sensitive
information before publishing it.
