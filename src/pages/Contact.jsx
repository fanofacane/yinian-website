import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { SectionHead, PageHero, Faq } from '../components/Sections.jsx';
import { CONTACT, FORM_ENDPOINT, SERVICES, PRODUCTS } from '../data/content.js';

const SERVICE_OPTIONS = [...SERVICES.map((s) => s.title), ...PRODUCTS.map((p) => p.title)];
const PHONE_RE = /^1[3-9]\d{9}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = '请填写姓名';
  if (!PHONE_RE.test(v.phone.replace(/[\s-]/g, ''))) e.phone = '请填写正确的手机号';
  if (!v.org.trim()) e.org = '请填写单位名称';
  if (!v.consent) e.consent = true;
  return e;
}

const EMPTY = { name: '', phone: '', org: '', role: '', size: '', service: [], message: '', consent: false };

function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'warn', text }
  const [sending, setSending] = useState(false);
  const formRef = useRef(null);

  function update(name, value) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function toggleService(s) {
    update('service', values.service.includes(s) ? values.service.filter((x) => x !== s) : [...values.service, s]);
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setSubmitted(true);
    setStatus(null);
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = ['name', 'phone', 'org', 'consent'].find((k) => e[k]);
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    if (!FORM_ENDPOINT) {
      setStatus({ type: 'warn', text: '在线表单暂未开通，请直接致电或添加微信与我们联系，我们会尽快回复。' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, service: values.service.join('、') }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setValues(EMPTY);
      setSubmitted(false);
      setStatus({ type: 'ok', text: '提交成功！我们会尽快与您联系。' });
    } catch {
      setStatus({ type: 'warn', text: '提交失败，请稍后重试，或直接致电 / 添加微信联系我们。' });
    } finally {
      setSending(false);
    }
  }

  const field = (name, label, props = {}, required = false) => (
    <div className={`field${errors[name] ? ' invalid' : ''}`}>
      <label htmlFor={`f-${name}`}>{label}{required && <span className="req">*</span>}</label>
      <input id={`f-${name}`} name={name} value={values[name]} aria-invalid={!!errors[name]}
        onChange={(e) => update(name, e.target.value)} {...props} />
      {errors[name] && <div className="err">{errors[name]}</div>}
    </div>
  );

  return (
    <form className="form-card reveal" ref={formRef} onSubmit={onSubmit} noValidate>
      <h2>留下你的需求</h2>
      <p>填写以下信息，我们的顾问会与你联系。</p>
      <div className="form-row">
        {field('name', '姓名', { autoComplete: 'name', placeholder: '请输入姓名' }, true)}
        {field('phone', '手机号', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '请输入 11 位手机号' }, true)}
      </div>
      <div className="form-row">
        {field('org', '企业 / 院校名称', { autoComplete: 'organization', placeholder: '请输入单位名称' }, true)}
        {field('role', '职务', { autoComplete: 'organization-title', placeholder: '如：总经理、培训负责人' })}
      </div>
      <div className="field">
        <label htmlFor="f-size">团队规模</label>
        <select id="f-size" name="size" value={values.size} onChange={(e) => update('size', e.target.value)}>
          <option value="">请选择</option>
          {['50 人以下', '50–200 人', '200–1000 人', '1000 人以上'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <fieldset className="field">
        <legend>感兴趣的服务（可多选）</legend>
        <div className="chips">
          {SERVICE_OPTIONS.map((s) => (
            <label key={s}>
              <input type="checkbox" checked={values.service.includes(s)} onChange={() => toggleService(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="f-message">需求描述</label>
        <textarea id="f-message" name="message" value={values.message} onChange={(e) => update('message', e.target.value)}
          placeholder="简单介绍你的业务现状、希望 AI 解决的问题或想了解的内容" />
      </div>
      <label className={`consent${errors.consent ? ' invalid' : ''}`}>
        <input type="checkbox" name="consent" checked={values.consent} onChange={(e) => update('consent', e.target.checked)} />
        <span>我已知悉并同意：所填信息仅用于一念智能与我联系及沟通服务需求，不会用于其他用途。</span>
      </label>
      <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? '提交中…' : '提交咨询'}</button>
      <div className={`form-msg${status ? ` show ${status.type}` : ''}`} role="status" aria-live="polite">{status?.text}</div>
    </form>
  );
}

export default function Contact() {
  return (
    <>
      <PageHero crumb="联系我们" title="预约咨询" text="告诉我们你的业务现状与目标，我们会帮你判断从哪里开始最合适。" />
      <section className="section pt-40">
        <div className="container contact-grid">
          <ContactForm />
          <aside className="contact-side reveal">
            <div className="c-item"><span className="svc-ico"><Icon name="phone" /></span><div><b>咨询电话</b><span>{CONTACT.phone}</span></div></div>
            <div className="c-item"><span className="svc-ico"><Icon name="mail" /></span><div><b>商务邮箱</b><span>{CONTACT.email}</span></div></div>
            <div className="c-item"><span className="svc-ico"><Icon name="pin" /></span><div><b>办公地址</b><span>{CONTACT.address}</span></div></div>
            {/* TODO: 替换为微信二维码图片 */}
            <div className="qr"><div className="qr-box">微信二维码</div><div><b>添加顾问微信</b><p>扫码添加，获取课程安排与服务方案。</p></div></div>
            <div className="steps-mini">
              <h3>咨询流程</h3>
              <ul>
                {['提交需求或添加顾问微信', '顾问了解业务现状与目标', '推荐合适的服务与切入点', '确认服务范围、阶段安排与费用'].map((t, i) => (
                  <li key={t}><i>{i + 1}</i><span>{t}</span></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="常见问题" title="咨询前你可能想了解" />
          <Faq indexes={[0, 3, 4, 5]} />
        </div>
      </section>
    </>
  );
}
