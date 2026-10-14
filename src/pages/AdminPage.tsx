import { useState, type FormEvent } from 'react';
import type { Product, Role, User } from '../types';

interface AdminPageProps {
  user: User;
  users: User[];
  products: Product[];
  categories: string[];
  onSaveProduct: (product: Product) => void;
  onSaveProducts: (products: Product[]) => void;
  onDeleteProduct: (id: string) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onSaveCategories: (categories: string[]) => void;
  notify: (text: string, kind?: 'success' | 'error' | 'info') => void;
}

const emptyProduct = (category: string): Product => ({ id: '', categoria: category, nombre: '', principioActivo: '', presentacion: '', especie: 'Perro / Gato', stock: 0, precio: 0, icono: '🐾' });

export function AdminPage({ user, users, products, categories, onSaveProduct, onSaveProducts, onDeleteProduct, onSaveUser, onDeleteUser, onSaveCategories, notify }: AdminPageProps) {
  const isAdmin = user.role === 'administrador';
  const [tab, setTab] = useState<'products' | 'users' | 'categories'>('products');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [userMessage, setUserMessage] = useState('');

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    onSaveProduct({ ...editing, precio: Number(editing.precio), stock: Number(editing.stock) });
    setEditing(null);
    notify('Producto guardado correctamente.', 'success');
  }

  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const correo = String(form.get('correo')).trim().toLowerCase();
    if (users.some((item) => item.correo.toLowerCase() === correo)) {
      setUserMessage('Ya existe una cuenta con ese correo.');
      return;
    }
    onSaveUser({
      id: '', nombre: String(form.get('nombre')).trim(), apellido: String(form.get('apellido')).trim(),
      correo, password: String(form.get('password')), role: isAdmin ? String(form.get('role')) as Role : 'cliente',
      fechaNacimiento: '', direccion: '', region: '', genero: '', compras: [], intentosFallidos: 0, bloqueado: false,
    });
    event.currentTarget.reset();
    setUserMessage('Cuenta creada.');
  }

  function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;
    const form = new FormData(event.currentTarget);
    const correo = String(form.get('correo')).trim().toLowerCase();
    if (users.some((account) => account.id !== editingUser.id && account.correo.toLowerCase() === correo)) {
      setUserMessage('Ya existe una cuenta con ese correo.');
      return;
    }
    const password = String(form.get('password'));
    onSaveUser({
      ...editingUser,
      nombre: String(form.get('nombre')).trim(),
      apellido: String(form.get('apellido')).trim(),
      correo,
      role: isAdmin && editingUser.id !== user.id ? String(form.get('role')) as Role : editingUser.role,
      password: password || editingUser.password,
    });
    setEditingUser(null);
    setUserMessage('Usuario actualizado.');
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryInput.trim();
    if (!name || categories.some((category) => category.toLowerCase() === name.toLowerCase())) return;
    onSaveCategories([...categories, name]);
    setCategoryInput('');
    notify('Categoría agregada.', 'success');
  }

  return (
    <main className="section admin-page">
      <div className="container">
        <div className="admin-heading">
          <div><p className="eyebrow">Gestión interna</p><h1>Panel de {isAdmin ? 'administración' : 'ventas'}</h1><p>Sesión: {user.nombre} {user.apellido} · {user.role}</p></div>
          <a className="button button--outline" href="catalogo.html">Ver tienda</a>
        </div>
        <div className="admin-summary">
          <div><span>Productos activos</span><strong>{products.length}</strong></div>
          {isAdmin && <div><span>Cuentas registradas</span><strong>{users.length}</strong></div>}
          <div><span>Categorías</span><strong>{categories.length}</strong></div>
        </div>
        <div className="admin-workspace">
          <div className="admin-tabs" role="tablist" aria-label="Secciones de gestión">
            <button className={tab === 'products' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'products'} onClick={() => setTab('products')}>Productos y stock</button>
            {isAdmin && <button className={tab === 'users' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'users'} onClick={() => setTab('users')}>Usuarios</button>}
            {isAdmin && <button className={tab === 'categories' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'categories'} onClick={() => setTab('categories')}>Categorías</button>}
          </div>

          {tab === 'products' && <section className="admin-section">
            <div className="admin-section-title"><div><h2>Productos</h2><p>{isAdmin ? 'Crea, edita o elimina productos.' : 'Consulta productos y actualiza sus existencias.'}</p></div>
              {isAdmin && <button className="button" type="button" onClick={() => setEditing(emptyProduct(categories[0] ?? 'General'))}>Nuevo producto</button>}
            </div>
            {editing && isAdmin && <form className="admin-form" onSubmit={saveProduct}>
              <h3>{editing.id ? 'Editar producto' : 'Crear producto'}</h3>
              <div className="form-row">
                <label className="form-group">Nombre<input required value={editing.nombre} onChange={(event) => setEditing({ ...editing, nombre: event.target.value })} /></label>
                <label className="form-group">Categoría<select value={editing.categoria} onChange={(event) => setEditing({ ...editing, categoria: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="form-group">Principio activo<input required value={editing.principioActivo} onChange={(event) => setEditing({ ...editing, principioActivo: event.target.value })} /></label>
                <label className="form-group">Presentación<input required value={editing.presentacion} onChange={(event) => setEditing({ ...editing, presentacion: event.target.value })} /></label>
                <label className="form-group">Especie<input required value={editing.especie} onChange={(event) => setEditing({ ...editing, especie: event.target.value })} /></label>
                <label className="form-group">Precio<input required min="0" type="number" value={editing.precio} onChange={(event) => setEditing({ ...editing, precio: Number(event.target.value) })} /></label>
                <label className="form-group">Stock<input required min="0" type="number" value={editing.stock} onChange={(event) => setEditing({ ...editing, stock: Number(event.target.value) })} /></label>
                <label className="form-group">Ícono<input maxLength={4} value={editing.icono} onChange={(event) => setEditing({ ...editing, icono: event.target.value })} /></label>
              </div>
              <div className="admin-actions"><button className="button" type="submit">Guardar producto</button><button className="button button--outline" type="button" onClick={() => setEditing(null)}>Cancelar</button></div>
            </form>}
            <div className="table-scroll"><table className="admin-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>
              {products.map((product) => <ProductRow key={product.id} product={product} isAdmin={isAdmin} onSave={onSaveProduct} onEdit={() => setEditing(product)} onDelete={() => { if (window.confirm(`¿Eliminar ${product.nombre}?`)) onDeleteProduct(product.id); }} />)}
            </tbody></table></div>
            {!isAdmin && <form className="admin-form seller-user-form" onSubmit={addUser}>
              <h3>Crear cuenta cliente</h3><p>Las cuentas creadas desde ventas siempre reciben el rol cliente.</p><div className="form-row">
                <label className="form-group">Nombre<input name="nombre" required /></label><label className="form-group">Apellido<input name="apellido" required /></label>
                <label className="form-group">Correo<input name="correo" type="email" required /></label><label className="form-group">Contraseña<input name="password" type="password" minLength={8} required /></label>
              </div><button className="button" type="submit">Crear cliente</button>{userMessage && <p role="status">{userMessage}</p>}
            </form>}
          </section>}

          {tab === 'users' && isAdmin && <section className="admin-section">
            <div className="admin-section-title"><div><h2>Usuarios</h2><p>Administra cuentas y asigna roles al crearlas.</p></div></div>
            <form className="admin-form" onSubmit={addUser}>
              <h3>Crear cuenta</h3><div className="form-row">
                <label className="form-group">Nombre<input name="nombre" required /></label><label className="form-group">Apellido<input name="apellido" required /></label>
                <label className="form-group">Correo<input name="correo" type="email" required /></label><label className="form-group">Contraseña<input name="password" type="password" minLength={8} required /></label>
                <label className="form-group">Rol<select name="role"><option value="cliente">Cliente</option><option value="vendedor">Vendedor</option><option value="administrador">Administrador</option></select></label>
              </div><button className="button" type="submit">Crear usuario</button>{userMessage && <p role="status">{userMessage}</p>}
            </form>
            {editingUser && <form className="admin-form" onSubmit={updateUser}>
              <h3>Editar cuenta: {editingUser.correo}</h3><div className="form-row">
                <label className="form-group">Nombre<input name="nombre" defaultValue={editingUser.nombre} required /></label><label className="form-group">Apellido<input name="apellido" defaultValue={editingUser.apellido} required /></label>
                <label className="form-group">Correo<input name="correo" type="email" defaultValue={editingUser.correo} required /></label><label className="form-group">Nueva contraseña<input name="password" type="password" minLength={8} placeholder="Dejar en blanco para conservar" /></label>
                <label className="form-group">Rol<select name="role" defaultValue={editingUser.role} disabled={editingUser.id === user.id}><option value="cliente">Cliente</option><option value="vendedor">Vendedor</option><option value="administrador">Administrador</option></select></label>
              </div><div className="admin-actions"><button className="button" type="submit">Guardar cambios</button><button className="button button--outline" type="button" onClick={() => setEditingUser(null)}>Cancelar</button></div>
            </form>}
            <div className="table-scroll"><table className="admin-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acción</th></tr></thead><tbody>
              {users.map((account) => <tr key={account.id}><td>{account.nombre} {account.apellido}</td><td>{account.correo}</td><td>{account.role}</td><td><div className="table-actions"><button className="table-action" type="button" onClick={() => setEditingUser(account)}>Editar</button><button className="table-action table-action--danger" type="button" disabled={account.id === user.id || account.id.startsWith('demo-')} onClick={() => { if (window.confirm(`¿Eliminar la cuenta ${account.correo}?`)) onDeleteUser(account.id); }}>Eliminar</button></div></td></tr>)}
            </tbody></table></div>
          </section>}

          {tab === 'categories' && isAdmin && <section className="admin-section">
            <div className="admin-section-title"><div><h2>Categorías</h2><p>Las categorías alimentan los filtros de la tienda.</p></div></div>
            <form className="category-create" onSubmit={addCategory}><label className="form-group">Nueva categoría<input value={categoryInput} onChange={(event) => setCategoryInput(event.target.value)} required /></label><button className="button" type="submit">Agregar</button></form>
            <ul className="category-list">{categories.map((category) => <li key={category}><span>{category}</span><div className="table-actions"><button className="table-action" type="button" onClick={() => {
              const name = window.prompt('Nuevo nombre de categoría:', category)?.trim();
              if (!name || name === category) return;
              if (categories.some((item) => item.toLowerCase() === name.toLowerCase())) { notify('Ya existe una categoría con ese nombre.', 'error'); return; }
              onSaveCategories(categories.map((item) => item === category ? name : item));
              onSaveProducts(products.map((product) => product.categoria === category ? { ...product, categoria: name } : product));
            }}>Editar</button><button className="table-action table-action--danger" type="button" onClick={() => {
              if (products.some((product) => product.categoria === category)) { notify('Primero cambia de categoría los productos asociados.', 'error'); return; }
              onSaveCategories(categories.filter((item) => item !== category));
            }}>Eliminar</button></div></li>)}</ul>
          </section>}
        </div>
      </div>
    </main>
  );
}

interface ProductRowProps {
  product: Product;
  isAdmin: boolean;
  onSave: (product: Product) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProductRow({ product, isAdmin, onSave, onEdit, onDelete }: ProductRowProps) {
  const [stock, setStock] = useState(product.stock);
  return <tr><td><strong>{product.icono} {product.nombre}</strong><small>{product.presentacion}</small></td><td>{product.categoria}</td><td>${product.precio.toLocaleString('es-CL')}</td><td>{isAdmin ? product.stock : <form className="stock-edit" onSubmit={(event) => { event.preventDefault(); onSave({ ...product, stock: Number(stock) }); }}><input aria-label={`Stock de ${product.nombre}`} min="0" type="number" value={stock} onChange={(event) => setStock(Number(event.target.value))} /><button type="submit">Guardar</button></form>}</td><td>{isAdmin ? <div className="table-actions"><button className="table-action" type="button" onClick={onEdit}>Editar</button><button className="table-action table-action--danger" type="button" onClick={onDelete}>Eliminar</button></div> : <span className="role-note">Solo stock</span>}</td></tr>;
}