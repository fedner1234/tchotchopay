import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';

class ReceiveScreen extends StatefulWidget {
  final String walletAddress;
  final String phoneNumber;

  const ReceiveScreen({
    super.key,
    this.walletAddress = '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
    this.phoneNumber = '+509 3712-3456',
  });

  @override
  State<ReceiveScreen> createState() => _ReceiveScreenState();
}

class _ReceiveScreenState extends State<ReceiveScreen> {
  int _selectedTab = 0; // 0 = Base Network (Crypto), 1 = Local Agent (Cash)

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard!'),
        backgroundColor: const Color(0xFF00C087),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final String activeQrData =
        _selectedTab == 0 ? widget.walletAddress : widget.phoneNumber;

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F19),
        elevation: 0,
        title: const Text(
          'Receive & Cash In',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        children: [
          // Mode Selector (Base USDC vs Agent Cash-In)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF161F30),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTab = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _selectedTab == 0
                            ? const Color(0xFF0052FF)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Base USDC',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTab = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _selectedTab == 1
                            ? const Color(0xFF00C087)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Agent Cash-In',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),

          // QR Code Card
          Center(
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: QrImageView(
                data: activeQrData,
                version: QrVersions.auto,
                size: 220.0,
                backgroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Label
          Text(
            _selectedTab == 0
                ? 'Your Base Network Address'
                : 'Your Agent Deposit ID',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF8E9BAE),
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),

          // Copyable Address / Phone Box
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF161F30),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF27354E)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _selectedTab == 0
                        ? widget.walletAddress
                        : widget.phoneNumber,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy,
                      color: Color(0xFF0052FF), size: 20),
                  onPressed: () => _copyToClipboard(
                    _selectedTab == 0
                        ? widget.walletAddress
                        : widget.phoneNumber,
                    _selectedTab == 0 ? 'Address' : 'Phone Number',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Info / Instruction Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF161F30),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF27354E)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  _selectedTab == 0
                      ? Icons.info_outline
                      : Icons.store_outlined,
                  color: _selectedTab == 0
                      ? const Color(0xFF0052FF)
                      : const Color(0xFF00C087),
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _selectedTab == 0
                        ? 'Send only USDC on Base Network. Deposits from other blockchains or tokens may be permanently lost.'
                        : 'Present this QR code or your phone number to any authorized Tchotcho Pay agent in Haiti to deposit HTG or USD cash instantly.',
                    style: const TextStyle(
                        color: Color(0xFF8E9BAE), fontSize: 13, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
