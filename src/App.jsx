import { useState, useEffect } from 'react';
import axios from 'axios';

const Icons = {
  Wallet: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  Up: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>,
  Down: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Edit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
};

function App() {
  const [txs, setTxs] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0] });
  const [editId, setEditId] = useState(null);
  const API = 'http://localhost:3000/transactions';

  const loadData = async () => setTxs((await axios.get(API)).data.reverse());
  useEffect(() => { loadData(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return alert("Lengkapi data");
    await axios[editId ? 'put' : 'post'](editId ? `${API}/${editId}` : API, { ...form, amount: +form.amount });
    setForm({ title: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0] });
    setEditId(null); loadData();
  };

  const remove = async (id) => confirm('Hapus?') && (await axios.delete(`${API}/${id}`), loadData());
  const edit = (item) => { setForm(item); setEditId(item.id); };
  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const handleChange = (e) => setForm({ ...form, [e.target.type === 'text' || e.target.type === 'select-one' ? 'title' : e.target.name || 'type']: e.target.value }); // Simplified handler logic if inputs have names, else manual below

  const income = txs.filter(t => t.type === 'income').reduce((a, c) => a + c.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((a, c) => a + c.amount, 0);

  const stats = [
    { title: 'Total Balance', val: fmt(income - expense), icon: <Icons.Wallet />, style: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white', iconBg: 'bg-white/20' },
    { title: 'Pemasukan', val: fmt(income), icon: <Icons.Up />, style: 'bg-white border-l-4 border-emerald-400', iconBg: 'bg-emerald-100 text-emerald-600', valColor: 'text-gray-800' },
    { title: 'Pengeluaran', val: fmt(expense), icon: <Icons.Down />, style: 'bg-white border-l-4 border-rose-400', iconBg: 'bg-rose-100 text-rose-600', valColor: 'text-gray-800' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div><h1 className="text-4xl font-extrabold text-indigo-900">Financial Dashboard</h1><p className="text-gray-500 mt-2">Kelola keuanganmu.</p></div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-gray-600">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((s, i) => (
            <div key={i} className={`${s.style} rounded-2xl p-6 shadow-md hover:scale-105 transition-all`}>
              <div className="flex justify-between mb-4"><span className={`${s.iconBg} p-2 rounded-lg`}>{s.icon}</span><span className={s.valColor || "text-indigo-100"}>{s.title}</span></div>
              <h2 className="text-2xl font-bold">{s.val}</h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
            <h3 className="text-xl font-bold mb-6">{editId ? '✏️ Edit' : '➕ Baru'}</h3>
            <form onSubmit={save} className="space-y-4">
              {['title', 'amount'].map(field => (
                <div key={field}><label className="text-xs font-bold text-gray-500 uppercase">{field}</label>
                <input required type={field === 'amount' ? 'number' : 'text'} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500" 
                  value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={field} /></div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Tipe</label>
                  <select className="w-full mt-1 p-3 border rounded-xl bg-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option>
                  </select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Tanggal</label>
                  <input type="date" className="w-full mt-1 p-3 border rounded-xl" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${editId ? 'bg-yellow-500' : 'bg-indigo-600'}`}>{editId ? 'Update' : 'Simpan'}</button>
                {editId && <button onClick={() => { setEditId(null); setForm({title:'', amount:'', type:'income', date: new Date().toISOString().split('T')[0]}) }} className="px-4 bg-gray-200 rounded-xl font-bold">Batal</button>}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">Riwayat</h3><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{txs.length} Data</span></div>
            <div className="overflow-auto max-h-[500px]"><table className="w-full text-left"><thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0"><tr><th className="p-4">Detail</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Jml</th><th className="p-4 text-center">Aksi</th></tr></thead>
              <tbody className="divide-y">{txs.length === 0 ? <tr><td colSpan="4" className="p-10 text-center text-gray-400">Kosong</td></tr> : txs.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 group">
                  <td className="p-4 font-bold">{t.title}<div className="text-xs text-gray-400 font-normal">{t.date}</div></td>
                  <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${t.type==='income'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{t.type==='income'?'In':'Out'}</span></td>
                  <td className={`p-4 text-right font-bold ${t.type==='income'?'text-emerald-600':'text-rose-600'}`}>{t.type==='income'?'+':'-'}{fmt(t.amount)}</td>
                  <td className="p-4 text-center"><div className="flex justify-center gap-2 lg:opacity-0 group-hover:opacity-100">
                    <button onClick={() => edit(t)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Icons.Edit/></button>
                    <button onClick={() => remove(t.id)} className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Icons.Trash/></button>
                  </div></td></tr>))}</tbody></table></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;