import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, Check, ChevronRight, Eye, FileCheck2, Landmark, LockKeyhole, MessageSquareText, RefreshCw, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react'
import './styles.css'

type View = 'home' | 'app' | 'proof'
type Purpose = 'Rent a home' | 'Apply for a loan' | 'Apply for a visa' | 'General income proof'

const payments = [
  { client: 'Northwind Studio', date: 'Oct 31, 2026', amount: '$2,400.00', kind: 'Recurring client income', confidence: 98, paypal: '7JH29841LY', tone: 'good' },
  { client: 'Kestrel Labs', date: 'Oct 28, 2026', amount: '$1,850.00', kind: 'Recurring client income', confidence: 94, paypal: '2LA77195PX', tone: 'good' },
  { client: 'Mercury Creative', date: 'Oct 14, 2026', amount: '$620.00', kind: 'One-off project', confidence: 89, paypal: '9CW44102MP', tone: 'neutral' },
  { client: 'Personal transfer', date: 'Oct 02, 2026', amount: '$900.00', kind: 'Not income', confidence: 82, paypal: '4XE03811QK', tone: 'warn' },
]

function Mark() {
  return <button className="mark" onClick={() => location.hash = ''} aria-label="Statable home"><span className="mark-icon"><i/><i/><i/></span><span>Statable</span></button>
}

function App() {
  const initial = location.hash.startsWith('#app') ? 'app' : location.hash.startsWith('#proof') ? 'proof' : 'home'
  const [view, setView] = useState<View>(initial)
  const go = (next: View) => { setView(next); location.hash = next === 'home' ? '' : next; scrollTo(0, 0) }
  return view === 'home' ? <Home go={go}/> : view === 'app' ? <Dashboard go={go}/> : <Proof go={go}/>
}

function Home({ go }: { go: (v: View) => void }) {
  return <div>
    <header className="nav"><Mark/><nav><a href="#how">How it works</a><a href="#proof-section">What gets shared</a><a href="#security">Privacy</a></nav><div className="nav-actions"><button className="text-btn" onClick={() => go('proof')}>View sample proof</button><button className="button small" onClick={() => go('app')}>Create income proof <ArrowRight size={15}/></button></div></header>
    <main>
      <section className="hero">
        <div className="eyebrow"><span className="paypal-p">P</span> Built with PayPal + AI</div>
        <h1>Proof of income for people without payslips.</h1>
        <p className="hero-copy">Statable turns verified PayPal payments into clear, shareable income proof—without exposing what you buy or how much money you have.</p>
        <div className="hero-actions"><button className="button" onClick={() => go('app')}>Create income proof <ArrowRight size={18}/></button><button className="ghost" onClick={() => go('proof')}><Eye size={18}/> View a sample</button></div>
        <p className="micro"><LockKeyhole size={13}/> Read-only access · Your purchases and balance stay private</p>
        <div className="proof-window">
          <div className="browser-bar"><span/><span/><span/><div>verify.statable.app/p/AM-2841</div></div>
          <div className="proof-preview">
            <div className="preview-left"><div className="verified-icon"><Check/></div><p className="caps">VERIFIED INCOME PROOF</p><h2>Amina earns an average of<br/><em>$4,870 per month.</em></h2><p>Verified from 6 months of completed PayPal payments from 4 independent clients.</p><div className="verified-by"><span className="paypal-p">P</span><div><b>Payments verified by PayPal</b><small>Last checked November 4, 2026</small></div></div></div>
            <div className="preview-card"><p className="caps">INCOME SUMMARY</p><div className="big-stat">$58,440 <small>/ year</small></div><div className="meter"><span style={{width:'86%'}}/></div><p><b>86% recurring</b> · Strong consistency</p><hr/><div className="metric-row"><span>Income sources</span><b>4 clients</b></div><div className="metric-row"><span>History verified</span><b>6 months</b></div><div className="metric-row"><span>Refunds excluded</span><b><Check size={15}/> Yes</b></div></div>
          </div>
        </div>
      </section>

      <section className="problem"><p className="section-label">A VERY COMMON PROBLEM</p><h2>Your income is real.<br/>The paperwork hasn't caught up.</h2><div className="audiences"><span>Freelancers</span><i>·</i><span>Creators</span><i>·</i><span>Contractors</span><i>·</i><span>Gig workers</span><i>·</i><span>Founders</span></div><p>If you don't receive a traditional payslip, proving what you earn can mean downloading statements, hiding purchases, chasing clients, and explaining every payment from scratch.</p></section>

      <section id="how" className="steps section-wrap"><p className="section-label">HOW IT WORKS</p><h2>From payment to proof in minutes.</h2><div className="step-grid">
        <Step n="01" icon={<WalletCards/>} title="Connect PayPal" body="Statable reads completed payments and invoices. It can never move your money."/>
        <Step n="02" icon={<Sparkles/>} title="AI understands your income" body="Payments are matched to clients and classified as recurring, one-off, refunded, or not income."/>
        <Step n="03" icon={<FileCheck2/>} title="Create only the proof you need" body="Choose rent, lending, visa, or general proof. Share the result—not your private account history."/>
      </div></section>

      <section className="ai-section section-wrap"><div><p className="section-label">EXPLAINABLE AI</p><h2>Not just a label.<br/>A reason you can check.</h2><p>Statable shows exactly why a payment counts as income. You stay in control when anything is unclear.</p><button className="text-link" onClick={() => go('app')}>See your income record <ArrowRight size={16}/></button></div><div className="ai-card"><div className="ai-top"><Sparkles size={18}/><b>Statable classified this payment</b><span>94% confident</span></div><div className="payment-line"><span className="avatar">K</span><div><b>Kestrel Labs</b><small>PayPal payment · $1,850.00</small></div><strong>Recurring income</strong></div><div className="reason"><p>Why this counts as recurring income</p><ul><li><Check size={14}/>Same client paid the same amount for 5 months</li><li><Check size={14}/>Matches invoice INV-104 and service agreement</li><li><Check size={14}/>Payment is completed with no refund or dispute</li></ul></div></div></section>

      <section id="proof-section" className="privacy section-wrap"><div className="privacy-card"><div><ShieldCheck/><p className="section-label">PRIVATE BY DEFAULT</p><h2>Share the answer.<br/>Not your account.</h2></div><div className="compare"><div><p>What they see</p><span><Check/>Verified monthly income</span><span><Check/>Income consistency</span><span><Check/>Number of clients</span><span><Check/>Verification date</span></div><div className="hidden"><p>What stays private</p><span><X/>Your purchases</span><span><X/>Your PayPal balance</span><span><X/>Client contact details</span><span><X/>Unrelated transactions</span></div></div></div></section>

      <section className="use-cases section-wrap"><p className="section-label">ONE RECORD, MANY MOMENTS</p><h2>Use it wherever someone asks,<br/>“Can you prove what you earn?”</h2><div className="case-grid"><Use icon={<Landmark/>} title="Rent a home" body="Give a landlord a clear income summary without handing over your full financial life."/><Use icon={<FileCheck2/>} title="Apply for a loan" body="Show recurring earnings, client diversity, and payment history in one verifiable record."/><Use icon={<ShieldCheck/>} title="Apply for a visa" body="Generate purpose-specific proof backed by completed payment data and clear methodology."/></div></section>
    </main>
    <footer><div><Mark/><p>Proof of income for people without payslips.</p></div><button className="button" onClick={() => go('app')}>Create income proof <ArrowRight size={17}/></button><p className="fine">Statable is not a bank, lender, credit bureau, or legal advisor. Demo data shown.</p></footer>
  </div>
}

function Step({n, icon, title, body}:{n:string,icon:React.ReactNode,title:string,body:string}) { return <article className="step"><div><span>{n}</span>{icon}</div><h3>{title}</h3><p>{body}</p></article> }
function Use({icon,title,body}:{icon:React.ReactNode,title:string,body:string}) { return <article className="use">{icon}<h3>{title}</h3><p>{body}</p><ChevronRight size={18}/></article> }

function Dashboard({ go }: { go: (v: View) => void }) {
  const [purpose, setPurpose] = useState<Purpose>('Rent a home')
  const [connected, setConnected] = useState(false)
  const [creating, setCreating] = useState(false)
  const [proofError, setProofError] = useState('')
  const paypalReturn = new URLSearchParams(location.search)
  const returnedOrderId = paypalReturn.get('paypal') === 'approved' ? paypalReturn.get('token') : null
  const [invoiceOpen, setInvoiceOpen] = useState(Boolean(returnedOrderId))
  const [connectionLabel, setConnectionLabel] = useState('Connect PayPal')
  const [livePayments, setLivePayments] = useState<typeof payments>([])
  const [liveSummary, setLiveSummary] = useState({ total: 0, count: 0, clients: 0 })
  const [storageReady, setStorageReady] = useState(false)
  const shownPayments = livePayments.length ? livePayments : payments
  const recurring = useMemo(() => shownPayments.filter(p => p.kind.includes('Recurring')).length, [shownPayments])
  const syncPayments = async () => {
    try {
      const data = await fetch('/api/payments').then(r => r.json())
      setStorageReady(Boolean(data.configured))
      setLiveSummary(data.summary || { total: 0, count: 0, clients: 0 })
      setLivePayments((data.payments || []).map((p:any) => ({ client:p.payer, date:new Date(p.createdAt).toLocaleDateString(), amount:new Intl.NumberFormat('en-US',{style:'currency',currency:p.currency||'USD'}).format(p.amount), kind:p.classification, confidence:p.confidence, paypal:p.id, tone:['Not income','Refund','Loan','Internal transfer'].includes(p.classification)?'warn':'good' })))
    } catch { /* retain demo fallback */ }
  }
  useEffect(() => { syncPayments(); window.addEventListener('statable-payment', syncPayments); return () => window.removeEventListener('statable-payment', syncPayments) }, [])
  const create = async () => {
    setCreating(true); setProofError('')
    try {
      const response = await fetch('/api/proofs/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({purpose})})
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to create proof')
      setViewAndHash('proof', `id=${encodeURIComponent(data.id)}`)
    } catch (error) { setProofError(error instanceof Error ? error.message : 'Unable to create proof') }
    finally { setCreating(false) }
  }
  const setViewAndHash = (view: View, query = '') => { go(view); location.hash = `${view}${query ? `?${query}` : ''}` }
  const connectPayPal = async () => {
    setConnectionLabel('Checking PayPal…')
    try { const data = await fetch('/api/paypal/status').then(r => r.json()); setConnected(true); setConnectionLabel(data.configured ? 'PayPal Sandbox connected' : 'PayPal demo connected') }
    catch { setConnected(true); setConnectionLabel('PayPal demo connected') }
  }
  return <div className="app-shell"><aside><Mark/><div className="side-nav"><button className="active"><WalletCards/> Income</button><button><Sparkles/> Review <b>1</b></button><button><FileCheck2/> Proofs</button></div><div className="side-bottom"><div className="mini-user">AM</div><div><b>Amina Marku</b><small>Demo workspace</small></div></div></aside><main className="dashboard"><header><div><p className="crumb">INCOME RECORD</p><h1>Good morning, Amina.</h1></div><button className={connected?'connected':'connect'} onClick={connectPayPal}><span className="paypal-p">P</span>{connected?connectionLabel:connectionLabel}</button></header>
    <section className="summary-grid"><div className="summary-main"><p>Verified income captured</p><h2>{livePayments.length?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(liveSummary.total):'$4,870'}</h2><span className="positive">{livePayments.length?'Live PayPal Sandbox record':'↑ 6.8% over 6 months'}</span><div className="bars">{[48,61,57,72,69,84,78,91,88,96,90,100].map((h,i)=><i key={i} style={{height:h+'%'}} className={i>8?'hot':''}/>)}</div><div className="axis"><span>May</span><span>Nov</span></div></div><div className="stat"><p>Income consistency</p><h3>86<span>/100</span></h3><div className="ring"><span>Strong</span></div><small>{recurring} recurring client relationships detected</small></div><div className="stat"><p>Verified payments</p><h3>{livePayments.length?liveSummary.count:18} <span>payments</span></h3><div className="source-row"><span className="paypal-p">P</span><div><b>PayPal</b><small>{storageReady?'Live record connected':'Demo data · storage pending'}</small></div></div><small>{livePayments.length?`${liveSummary.clients} paying clients`:'18 completed payments analysed'}</small></div></section>
    <section className="work-grid"><div className="payments"><div className="panel-head"><div><p className="crumb">PAYMENT RECORD</p><h2>What counts as income</h2></div><div className="panel-actions"><button onClick={syncPayments}><RefreshCw size={15}/> Sync</button><button className="new-invoice" onClick={()=>setInvoiceOpen(true)}>+ Request PayPal payment</button></div></div>{shownPayments.map((p,i)=><div className="pay-row" key={p.paypal}><div className="avatar">{p.client[0]}</div><div className="pay-name"><b>{p.client}</b><small>{p.date} · PayPal ID {p.paypal}</small></div><div className={'classification '+p.tone}><b>{p.kind}</b><small><Sparkles size={11}/>{p.confidence}% AI confidence</small></div><strong>{p.amount}</strong>{i===3&&<button className="review-btn">Review</button>}</div>)}</div>
      <div className="builder"><p className="crumb">PROOF BUILDER</p><h2>What do you need to prove?</h2><p>We'll include only the information needed for this purpose.</p><div className="purpose-list">{(['Rent a home','Apply for a loan','Apply for a visa','General income proof'] as Purpose[]).map(x=><button className={purpose===x?'chosen':''} onClick={()=>setPurpose(x)} key={x}><span>{x}</span>{purpose===x?<Check size={16}/>:<ChevronRight size={16}/>}</button>)}</div><div className="share-note"><LockKeyhole size={17}/><span>Your purchases and balance will not be shared.</span></div>{proofError&&<p className="form-error">{proofError}</p>}<button className="button full" onClick={create}>{creating?'Building proof…':'Create '+purpose.toLowerCase()+' proof'} {!creating&&<ArrowRight size={16}/>}</button></div></section>
  </main>{invoiceOpen&&<InvoiceModal initialOrderId={returnedOrderId || undefined} close={()=>{setInvoiceOpen(false);history.replaceState(null,'','/#app')}}/>}</div>
}

function InvoiceModal({ close, initialOrderId }: { close: () => void; initialOrderId?: string }) {
  const [form, setForm] = useState({ client: 'Kestrel Labs', email: 'client@example.com', amount: '1850', description: 'Monthly product design services' })
  const [result, setResult] = useState<{id?:string;detail?:string;error?:string;demo?:boolean;status?:string;approveUrl?:string;captureId?:string}|null>(initialOrderId?{id:initialOrderId,status:'CHECKING',detail:'Confirming approval with PayPal…'}:null)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true); setResult(null)
    try { const response = await fetch('/api/paypal/create-order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, amount:Number(form.amount), currency:'USD'}) }); setResult(await response.json()) }
    catch { setResult({ error:'The PayPal payment service could not be reached.' }) }
    finally { setBusy(false) }
  }
  const check = async () => { if(!result?.id)return; setBusy(true); try { const data=await fetch(`/api/paypal/order-status?id=${encodeURIComponent(result.id)}`).then(r=>r.json()); setResult({...result,...data,detail:data.error||`PayPal reports this payment request as ${data.status || 'unknown'}.`}) } finally { setBusy(false) } }
  const capture = async () => { if(!result?.id)return; setBusy(true); try { const data=await fetch('/api/paypal/capture-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:result.id})}).then(r=>r.json()); setResult({...result,...data,detail:data.error||data.detail}); if(data.saved){ history.replaceState(null,'','/#app'); window.dispatchEvent(new Event('statable-payment')) } } finally { setBusy(false) } }
  useEffect(()=>{ if(initialOrderId) capture() },[])
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><button className="modal-close" onClick={close}><X size={18}/></button><div className="paypal-heading"><span className="paypal-p">P</span><div><p className="crumb">PAYPAL PAYMENT REQUEST</p><h2>Create verifiable income</h2></div></div><p>Ask a client to approve a real PayPal Sandbox payment. Once completed, Statable can use the verified PayPal event as income evidence.</p>{result?.id?<><div className="invoice-success"><Check/><div><b>Request {result.id} · {result.status || 'CREATED'}</b><p>{result.detail || 'Created securely through PayPal Sandbox.'}</p></div></div>{!result.demo&&<div className="invoice-actions">{result.approveUrl&&result.status==='CREATED'&&<a className="button full" href={result.approveUrl} target="_blank" rel="noreferrer">Approve in PayPal Sandbox <ArrowRight size={16}/></a>}<button className="button full secondary" onClick={result.status==='APPROVED'?capture:check} disabled={busy}>{busy?'Contacting PayPal…':result.status==='APPROVED'?'Capture verified payment':'Check payment status'} <ArrowRight size={16}/></button></div>}</>:<><label>Client name<input value={form.client} onChange={e=>setForm({...form,client:e.target.value})}/></label><label>Client email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><div className="field-row"><label>Amount<input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Currency<input value="USD" disabled/></label></div><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>{result?.error&&<p className="form-error">{result.error}</p>}<button className="button full" onClick={submit} disabled={busy}>{busy?'Creating securely…':'Create PayPal payment request'} {!busy&&<ArrowRight size={16}/>}</button></>}</div></div>
}

function Proof({ go }: { go: (v: View) => void }) {
  const proofId = new URLSearchParams(location.hash.split('?')[1] || '').get('id')
  return proofId ? <DynamicProof id={proofId} go={go}/> : <SampleProof go={go}/>
}

function DynamicProof({ id, go }: { id: string; go: (v: View) => void }) {
  const [proof, setProof] = useState<any>(null)
  const [error, setError] = useState('')
  useEffect(()=>{ fetch(`/api/proofs/get?id=${encodeURIComponent(id)}`).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);setProof(data.proof)}).catch(error=>setError(error.message)) },[id])
  if(error) return <div className="verify-page"><header className="verify-nav"><Mark/></header><main className="certificate"><div className="cert-head"><div className="verified-icon"><X/></div><p className="caps">PROOF UNAVAILABLE</p><h1>{error}</h1><button className="back-demo" onClick={()=>go('app')}>← Back to income record</button></div></main></div>
  if(!proof) return <div className="verify-page"><header className="verify-nav"><Mark/></header><main className="certificate"><div className="cert-head"><p className="caps">VERIFYING INCOME PROOF</p><h1>Checking the record…</h1></div></main></div>
  const s=proof.snapshot
  const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:s.currency||'USD',maximumFractionDigits:0}).format(value)
  return <div className="verify-page"><header className="verify-nav"><Mark/><span className="verified-badge"><ShieldCheck size={15}/> Verified by Statable</span></header><main className="certificate"><div className="cert-head"><div className="verified-icon"><Check/></div><p className="caps">VERIFIED INCOME PROOF · {proof.purpose.toUpperCase()}</p><h1>{s.subject} earns an average of<br/><em>{money(s.monthlyIncome)} per month.</em></h1><p>This privacy-scoped record is based only on completed PayPal income payments. Purchases, balances, and payer contact details are excluded.</p><div className="verified-by"><span className="paypal-p">P</span><div><b>Payment evidence verified by PayPal</b><small>Checked {new Date(s.verifiedAt).toLocaleString()}</small></div></div></div><div className="cert-grid"><div className="cert-stat"><p>Verified annual income</p><h2>{money(s.annualIncome)}</h2><small>Based on the verified period</small></div><div className="cert-stat"><p>Income consistency</p><h2>{s.consistency} <span>/ 100</span></h2><small>Explainable payment pattern score</small></div><div className="cert-stat"><p>Independent clients</p><h2>{s.clients}</h2><small>{s.paymentCount} completed payments</small></div></div><section className="evidence"><div><p className="crumb">WHAT WAS VERIFIED</p><h2>Evidence behind this proof</h2></div><div className="evidence-list">{s.evidence.map((item:any)=><p key={item.id}><Check/>{item.classification}: {money(item.amount)} · {item.confidence}% confidence</p>)}</div></section><div className="cert-foot"><span>Proof ID {proof.id}</span><span>Created {new Date(proof.createdAt).toLocaleDateString()}</span><span>Integrity check passed <Check size={13}/></span></div><button className="back-demo" onClick={()=>go('app')}>← Back to income record</button></main></div>
}

function SampleProof({ go }: { go: (v: View) => void }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('Is this income recurring?')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const ask = async () => { setAsking(true); try { const data = await fetch('/api/ai/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,proof:{monthlyIncome:4870,annualIncome:58440,consistency:86,clients:4,months:6,recurringShare:'86%',source:'PayPal'}})}).then(r=>r.json()); setAnswer(data.answer) } catch { setAnswer('This question could not be answered from the disclosed proof.') } finally { setAsking(false) } }
  return <div className="verify-page"><header className="verify-nav"><Mark/><span className="verified-badge"><ShieldCheck size={15}/> Verified by Statable</span></header><main className="certificate"><div className="cert-head"><div className="verified-icon"><Check/></div><p className="caps">VERIFIED INCOME PROOF</p><h1>Amina Marku earns an average of<br/><em>$4,870 per month.</em></h1><p>This record is based on six months of completed PayPal payments. It was created for a rental application and shares no purchases or account balance.</p><div className="verified-by"><span className="paypal-p">P</span><div><b>Payment history verified by PayPal</b><small>Last checked November 4, 2026 at 11:42 WAT</small></div></div></div><div className="cert-grid"><div className="cert-stat"><p>Verified annual income</p><h2>$58,440</h2><small>Based on trailing 6-month average</small></div><div className="cert-stat"><p>Income consistency</p><h2>86 <span>/ 100</span></h2><small>Strong recurring payment pattern</small></div><div className="cert-stat"><p>Independent clients</p><h2>4</h2><small>Largest client represents 49%</small></div></div><section className="evidence"><div><p className="crumb">WHAT WAS VERIFIED</p><h2>Evidence behind this proof</h2></div><div className="evidence-list"><p><Check/>18 completed PayPal payments</p><p><Check/>6 consecutive months of income</p><p><Check/>Refunds and personal transfers excluded</p><p><Check/>4 independent paying clients</p></div></section><section className="ask"><div><MessageSquareText/><div><b>Ask about this income proof</b><p>Answers use only the information Amina chose to share.</p></div><button onClick={()=>setOpen(!open)}>{open?'Close':'Ask Statable'}</button></div>{open&&<div className="answer"><div className="ask-row"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()}/><button onClick={ask} disabled={asking}>{asking?'Checking…':'Ask'}</button></div>{answer&&<><p>{answer}</p><small><Sparkles size={12}/> Answered only from this proof's disclosed evidence</small></>}</div>}</section><div className="cert-foot"><span>Proof ID ST-RNT-2841</span><span>Created November 4, 2026</span><span>Integrity check passed <Check size={13}/></span></div><button className="back-demo" onClick={() => go('app')}>← Back to product demo</button></main></div>
}

createRoot(document.getElementById('root')!).render(<App />)
