import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  Layers,
  X,
  Search
} from 'lucide-react';
import { useSubscriptionData } from '../context/SubscriptionDataContext';
import { Product, ProductVariant } from '../types';

interface ProductsViewProps {
  searchTerm: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ searchTerm }) => {
  const { products, addProduct, updateProduct, deleteProduct, plans } = useSubscriptionData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(49);
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState('');
  const [variantDelta, setVariantDelta] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('SaaS Platform');
    setPrice(49);
    setStatus('active');
    setDescription('');
    setFeatures(['Unlimited API requests', '24/7 dedicated support']);
    setVariants([
      { id: 'v_std', name: 'Starter Tier', priceDelta: 0 },
      { id: 'v_pro', name: 'Pro Tier (+50 Users)', priceDelta: 50 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category || 'General');
    setPrice(prod.price);
    setStatus(prod.status);
    setDescription(prod.description);
    setFeatures(prod.features || []);
    setVariants(prod.variants || []);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    if (!variantName.trim()) return;
    setVariants([
      ...variants,
      {
        id: `var_${Date.now()}`,
        name: variantName.trim(),
        priceDelta: variantDelta
      }
    ]);
    setVariantName('');
    setVariantDelta(50);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name,
          category,
          price,
          status,
          description,
          features,
          variants
        });
      } else {
        await addProduct({
          name,
          category,
          price,
          status,
          description,
          features,
          variants
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Product Catalog</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {products.length} Products
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your subscription offerings, feature sets, and tier configurations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map(prod => {
            const productPlans = plans.filter(p => p.productId === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {prod.category}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{prod.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archive ${prod.name}?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">{prod.description}</p>

                  {/* Price */}
                  <div className="pb-4 border-b border-slate-100 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">${prod.price}</span>
                    <span className="text-xs text-slate-400 font-medium">base price</span>
                  </div>

                  {/* Variants */}
                  {prod.variants && prod.variants.length > 0 && (
                    <div className="py-3 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Tier Variants ({prod.variants.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.variants.map(v => (
                          <span
                            key={v.id}
                            className="text-[10px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {v.name} {v.priceDelta > 0 ? `(+$${v.priceDelta})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="py-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Core Features
                    </span>
                    {(prod.features || []).slice(0, 3).map((f, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{productPlans.length} active plans</span>
                  </span>
                  <span
                    className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                      prod.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {prod.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. CloudScale Pro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    placeholder="e.g. Cloud Infrastructure"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Comprehensive description of product capability..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Feature Tags Builder */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feature Highlights</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add feature item..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-slate-800 text-white font-medium rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-[11px] flex items-center gap-1"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-blue-500 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Variants Builder */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiers & Variants</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="Variant name (e.g. Enterprise 500 nodes)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="number"
                    value={variantDelta}
                    onChange={(e) => setVariantDelta(parseFloat(e.target.value) || 0)}
                    placeholder="+$"
                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-slate-800 text-white font-medium rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map(v => (
                    <span
                      key={v.id}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[11px] flex items-center gap-1"
                    >
                      <span>{v.name} (+${v.priceDelta})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
