import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MapPin, Store, Trash2, Edit3, Power,
  ImageOff, Filter, X, Download, UploadCloud
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Distributor, User } from '../types';

interface DashboardProps {
  user: User | null;
  distributors: Distributor[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkAdd: (items: Omit<Distributor, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[]) => void;
}

export default function Dashboard({ user, distributors, onToggleStatus, onDelete, onBulkAdd }: DashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = distributors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true : filter === 'open' ? d.isOpen : !d.isOpen;
    return matchesSearch && matchesFilter;
  });

  const openCount = distributors.filter((d) => d.isOpen).length;
  const closedCount = distributors.filter((d) => !d.isOpen).length;

  const handleExportExcel = () => {
    const dataToExport = distributors.map(d => ({
      'Nome da Distribuidora': d.name,
      'Endereço': d.address,
      'Coordenadas (Localização)': d.location || 'Não informada',
      'Observação': d.observation || '',
      'Status': d.isOpen ? 'Aberta' : 'Fechada',
      'Data de Cadastro': new Date(d.createdAt).toLocaleDateString('pt-BR'),
      'Última Atualização': new Date(d.updatedAt).toLocaleDateString('pt-BR')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribuidoras');
    XLSX.writeFile(workbook, 'relatorio_distribuidoras.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newItems = data.map((row: any) => ({
          name: row['Nome da Distribuidora'] || row['Nome'] || row['name'] || 'Sem Nome',
          address: row['Endereço'] || row['Endereco'] || row['address'] || '',
          location: row['Coordenadas (Localização)'] || row['Coordenadas'] || row['location'] || '',
          observation: row['Observação'] || row['Observacao'] || row['observation'] || '',
          isOpen: row['Status'] === 'Aberta' || row['isOpen'] === true || row['Status'] === 'Aberto' || true,
          photo: null
        }));
        
        if (newItems.length > 0) {
          onBulkAdd(newItems);
          alert(`${newItems.length} distribuidoras importadas com sucesso!`);
        } else {
          alert('Nenhum dado encontrado no arquivo.');
        }
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique o formato e tente novamente.');
      }
      
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Todas as Distribuidoras
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {distributors.length} cadastrada{distributors.length !== 1 ? 's' : ''} — {openCount} aberta{openCount !== 1 ? 's' : ''}, {closedCount} fechada{closedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </>
          )}
          <Link
            to="/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou endereço..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'open' ? 'Abertas' : 'Fechadas'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
        >
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">
            {distributors.length === 0 ? 'Nenhuma distribuidora cadastrada' : 'Nenhuma distribuidora encontrada'}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {distributors.length === 0
              ? 'Cadastre sua primeira distribuidora para começar.'
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {distributors.length === 0 && (
            <Link
              to="/nova"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Cadastrar distribuidora
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {d.photo ? (
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.isOpen
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {d.isOpen ? 'Aberta' : 'Fechada'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate">{d.name}</h3>
                  <div className="flex items-start gap-1.5 mt-1.5 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{d.address}</span>
                  </div>
                  {d.location && (
                    <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{d.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onToggleStatus(d.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        d.isOpen
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {d.isOpen ? 'Fechar' : 'Aberta'}
                    </button>
                    <Link
                      to={`/editar/${d.id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(d.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-slate-800">Confirmar exclusão</h3>
              <p className="text-slate-500 text-sm mt-1">
                Tem certeza que deseja excluir esta distribuidora? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
