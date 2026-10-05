import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'screens/receive_screen.dart';

// Adjust this URL based on your testing environment:
// iOS Simulator: 'http://localhost:4000/api/v1'
// Android Emulator: 'http://10.0.2.2:4000/api/v1'
// Physical Device: Use your computer's local Wi-Fi IP (e.g., 'http://192.168.1.50:4000/api/v1')
const String baseApiUrl = 'http://localhost:4000/api/v1';

void main() {
  runApp(const TchotchoPayApp());
}

class TchotchoPayApp extends StatelessWidget {
  const TchotchoPayApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tchotcho Pay',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        primaryColor: const Color(0xFF0052FF),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0052FF),
          secondary: Color(0xFF00C087),
          surface: Color(0xFF161F30),
        ),
        useMaterial3: true,
      ),
      home: const MainNavigationScreen(),
    );
  }
}

// -------------------------------------------------------------
// MAIN TAB NAVIGATION
// -------------------------------------------------------------
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});
  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final List<Widget> _screens = [
    const HomeScreen(),
    const SendScreen(),
    const CardScreen(),
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF161F30),
        indicatorColor: const Color(0xFF0052FF).withOpacity(0.3),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.send_outlined), selectedIcon: Icon(Icons.send), label: 'Send'),
          NavigationDestination(icon: Icon(Icons.credit_card_outlined), selectedIcon: Icon(Icons.credit_card), label: 'Card'),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// 1. HOME SCREEN
// -------------------------------------------------------------
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  bool _showBalance = true;
  double _usdcBalance = 0.0;
  double _htgRate = 132.50;
  String _userName = 'Jean';

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _isLoading = true);
    try {
      final userRes = await http.get(Uri.parse('$baseApiUrl/user/%2B50937123456'));
      final rateRes = await http.get(Uri.parse('$baseApiUrl/rates'));
      if (userRes.statusCode == 200 && rateRes.statusCode == 200) {
        final userData = jsonDecode(userRes.body)['data'];
        final rateData = jsonDecode(rateRes.body)['data'];
        setState(() {
          _userName = userData['full_name'] ?? 'Jean';
          _usdcBalance = (userData['usdc_balance'] as num).toDouble();
          _htgRate = (rateData['rates']['HTG'] as num).toDouble();
        });
      }
    } catch (e) {
      debugPrint('Error fetching API: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,##0.00', 'en_US');
    final htgFormatted = currencyFormatter.format(_usdcBalance * _htgRate);

    return SafeArea(
      child: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0052FF)))
          : RefreshIndicator(
              onRefresh: _fetchDashboardData,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Bonjou, $_userName 👋', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Base L2 Network', style: TextStyle(color: Color(0xFF8E9BAE), fontSize: 13)),
                        ],
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.notifications_outlined),
                        style: IconButton.styleFrom(backgroundColor: const Color(0xFF161F30)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF161F30),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF27354E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total Available Balance', style: TextStyle(color: Color(0xFF8E9BAE), fontSize: 14)),
                            IconButton(
                              icon: Icon(_showBalance ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF8E9BAE), size: 20),
                              onPressed: () => setState(() => _showBalance = !_showBalance),
                            ),
                          ],
                        ),
                        Text(
                          _showBalance ? '\$${currencyFormatter.format(_usdcBalance)} USDC' : '•••••• USDC',
                          style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _showBalance ? '≈ $htgFormatted HTG' : '•••••••• HTG',
                          style: const TextStyle(color: Color(0xFF00C087), fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(color: const Color(0xFF222F46), borderRadius: BorderRadius.circular(12)),
                          child: Text('Rate: 1 USDC = $_htgRate HTG', style: const TextStyle(fontSize: 12, color: Color(0xFF8E9BAE))),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _actionButton(Icons.send, 'Send', const Color(0xFF0052FF), () {}),
                      _actionButton(Icons.call_received, 'Receive', const Color(0xFF222F46), () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const ReceiveScreen()));
                      }),
                      _actionButton(Icons.add, 'Add Cash', const Color(0xFF222F46), () {}),
                      _actionButton(Icons.credit_card, 'Card', const Color(0xFF222F46), () {}),
                    ],
                  ),
                  const SizedBox(height: 30),
                  const Text('Recent Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  ListTile(
                    tileColor: const Color(0xFF161F30),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFF27354E))),
                    leading: CircleAvatar(
                      backgroundColor: Colors.red.withOpacity(0.2),
                      child: const Text('MC', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    ),
                    title: const Text('Sent to MonCash', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('+509 3712-3456 • Completed', style: TextStyle(color: Color(0xFF8E9BAE), fontSize: 12)),
                    trailing: const Text('- \$50.00', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _actionButton(IconData icon, String label, Color bgColor, VoidCallback onTap) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(18)),
            child: Icon(icon, color: Colors.white, size: 22),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

// -------------------------------------------------------------
// 2. SEND SCREEN
// -------------------------------------------------------------
class SendScreen extends StatefulWidget {
  const SendScreen({super.key});
  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  String _selectedMethod = 'MONCASH';
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _recipientController = TextEditingController();
  bool _isSending = false;
  final double _htgRate = 132.50;

  Future<void> _handleSend() async {
    final double? amount = double.tryParse(_amountController.text);
    final String recipient = _recipientController.text.trim();
    if (amount == null || amount <= 0 || recipient.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a valid amount and recipient!')));
      return;
    }
    setState(() => _isSending = true);
    try {
      final response = await http.post(
        Uri.parse('$baseApiUrl/remit'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'senderPhone': '+50937123456', 'recipientIdentifier': recipient, 'amountUsdc': amount, 'method': _selectedMethod}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        if (!mounted) return;
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF161F30),
            title: const Text('Transfer Sent! 🎉'),
            content: Text('Sent \$${data['data']['amountSentUsdc']} USDC (${data['data']['amountReceivedHtg']} HTG) to $recipient via $_selectedMethod.'),
            actions: [TextButton(onPressed: () { Navigator.of(ctx).pop(); _amountController.clear(); _recipientController.clear(); }, child: const Text('Done', style: TextStyle(color: Color(0xFF00C087))))],
          ),
        );
      } else {
        throw Exception(data['message'] ?? 'Transfer failed.');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final double enteredUsdc = double.tryParse(_amountController.text) ?? 0.0;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Send Money to Haiti', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Row(children: [
            _buildTab('MONCASH', 'MonCash', Colors.red),
            const SizedBox(width: 8),
            _buildTab('NATCASH', 'NatCash', Colors.orange),
            const SizedBox(width: 8),
            _buildTab('WALLET', 'Base USDC', const Color(0xFF0052FF)),
          ]),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: const Color(0xFF161F30), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFF27354E))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('You send', style: TextStyle(color: Color(0xFF8E9BAE), fontSize: 13)),
              Row(children: [
                Expanded(child: TextField(controller: _amountController, keyboardType: const TextInputType.numberWithOptions(decimal: true), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold), decoration: const InputDecoration(hintText: '0.00', border: InputBorder.none), onChanged: (_) => setState(() {}))),
                const Text('USDC', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ]),
              Text('Recipient receives: ~${(enteredUsdc * _htgRate).toStringAsFixed(2)} HTG', style: const TextStyle(color: Color(0xFF00C087), fontSize: 13, fontWeight: FontWeight.w600)),
            ]),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: const Color(0xFF161F30), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFF27354E))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_selectedMethod == 'WALLET' ? 'Recipient Base Wallet / ENS' : "Recipient's Haiti Phone Number", style: const TextStyle(color: Color(0xFF8E9BAE), fontSize: 13)),
              TextField(controller: _recipientController, style: const TextStyle(fontSize: 16), decoration: InputDecoration(hintText: _selectedMethod == 'WALLET' ? '0x...' : '+509 3XXX XXXX', hintStyle: const TextStyle(color: Color(0xFF8E9BAE)), border: InputBorder.none)),
            ]),
          ),
          const SizedBox(height: 24),
          SizedBox(height: 56, child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0052FF), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
            onPressed: _isSending ? null : _handleSend,
            child: _isSending ? const CircularProgressIndicator(color: Colors.white) : const Text('Transfer Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          )),
        ],
      ),
    );
  }

  Widget _buildTab(String method, String label, Color color) {
    final bool isSelected = _selectedMethod == method;
    return Expanded(child: GestureDetector(
      onTap: () => setState(() => _selectedMethod = method),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(color: isSelected ? color : const Color(0xFF161F30), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF27354E))),
        alignment: Alignment.center,
        child: Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.white : const Color(0xFF8E9BAE))),
      ),
    ));
  }
}

// -------------------------------------------------------------
// 3. VIRTUAL VISA CARD SCREEN
// -------------------------------------------------------------
class CardScreen extends StatefulWidget {
  const CardScreen({super.key});
  @override
  State<CardScreen> createState() => _CardScreenState();
}

class _CardScreenState extends State<CardScreen> {
  bool _isFrozen = false;
  bool _showDetails = false;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Tchotcho Pay Card', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Opacity(
            opacity: _isFrozen ? 0.5 : 1.0,
            child: Container(
              height: 210,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF0D2B68), Color(0xFF001030)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.15)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('TCHOTCHO PAY', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                    Text('VISA', style: TextStyle(fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, fontSize: 22)),
                  ]),
                  Container(width: 40, height: 28, decoration: BoxDecoration(color: const Color(0xFFD4AF37), borderRadius: BorderRadius.circular(6))),
                  Text(_showDetails ? '4242  8821  9012  4920' : '••••  ••••  ••••  4920', style: const TextStyle(fontSize: 20, letterSpacing: 2, fontWeight: FontWeight.w600)),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('CARDHOLDER', style: TextStyle(fontSize: 10, color: Color(0xFF8E9BAE))),
                      Text('JEAN BAPTISTE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ]),
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('CVV', style: TextStyle(fontSize: 10, color: Color(0xFF8E9BAE))),
                      Text(_showDetails ? '382' : '•••', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ]),
                  ]),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          SwitchListTile(
            tileColor: const Color(0xFF161F30),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text('Show Details & CVV', style: TextStyle(fontWeight: FontWeight.w600)),
            value: _showDetails,
            onChanged: (val) => setState(() => _showDetails = val),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            tileColor: const Color(0xFF161F30),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text('Freeze Card', style: TextStyle(fontWeight: FontWeight.w600)),
            activeColor: Colors.red,
            value: _isFrozen,
            onChanged: (val) => setState(() => _isFrozen = val),
          ),
        ],
      ),
    );
  }
}
