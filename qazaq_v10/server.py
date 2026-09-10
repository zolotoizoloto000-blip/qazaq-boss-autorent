import os, json, secrets, uuid
from datetime import datetime, date
from pathlib import Path
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

BASE = Path(__file__).resolve().parent
UPLOAD_DIR = BASE / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=None)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024

raw_db = os.getenv('DATABASE_URL', '')
if raw_db.startswith('postgres://'):
    raw_db = raw_db.replace('postgres://', 'postgresql+psycopg://', 1)
elif raw_db.startswith('postgresql://'):
    raw_db = raw_db.replace('postgresql://', 'postgresql+psycopg://', 1)
if not raw_db:
    raw_db = 'sqlite:///' + str(BASE / 'qazaq_boss_v5.db')
app.config['SQLALCHEMY_DATABASE_URI'] = raw_db
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

DEFAULTS = {
 'qb_settings': {'company':'QAZAQ BOSS AUTORENT','whatsapp':'77752757063','phone':'+7 775 275 70 63','city':'Атырау','hours':'24/7 — онлайн-заявки','hero':'QAZAQ BOSS AUTORENT','subtitle':'Автопрокат • Такси • Трезвый водитель','success':'Заявка принята. Менеджер подтвердит стоимость и доступность.','ordersEnabled':True,'instagram':'','twoGis':'','supportEmail':'','faq':[{'q':'Какие документы нужны?','a':'Точный список документов менеджер подтверждает перед выдачей автомобиля.'},{'q':'Можно арендовать с водителем?','a':'Да, аренда с водителем доступна по предварительной заявке.'},{'q':'Как подтверждается бронь?','a':'После заявки менеджер проверяет доступность и подтверждает бронирование.'}]},
 'qb_cars_v2': [
  {'id':'c1','name':'Jaguar XJ','price':100000,'category':'Premium','year':2020,'gear':'Автомат','seats':5,'availability':'free','plate':'','description':'Премиальный седан для города и деловых поездок.','active':True,'driver':True,'image':'assets/jaguar-xj.svg','rating':4.9,'trips':48},
  {'id':'c2','name':'Jaguar F-Type','price':90000,'category':'Sport','year':2019,'gear':'Автомат','seats':2,'availability':'free','plate':'','description':'Спортивный автомобиль по предварительной заявке.','active':True,'driver':False,'image':'assets/jaguar-ftype.svg','rating':4.8,'trips':31},
  {'id':'c3','name':'Range Rover','price':80000,'category':'SUV','year':2020,'gear':'Автомат','seats':5,'availability':'busy','plate':'','description':'Премиальный SUV для города и межгорода.','active':True,'driver':True,'image':'assets/range-rover.svg','rating':4.9,'trips':64},
  {'id':'c4','name':'Range Rover Velar','price':70000,'category':'Premium SUV','year':2021,'gear':'Автомат','seats':5,'availability':'free','plate':'','description':'Комфортный премиальный кроссовер.','active':True,'driver':True,'image':'assets/range-rover-velar.svg','rating':5.0,'trips':52}],
 'qb_services': [
  {'id':'s1','name':'Автопрокат','price':'от 70 000 ₸','description':'Каталог автомобилей, бронь и подтверждение.','active':True},
  {'id':'s2','name':'Такси','price':'по расчёту','description':'Поездки по Атырау и межгороду.','active':True},
  {'id':'s3','name':'Трезвый водитель','price':'по расчёту','description':'Подача водителя по адресу клиента.','active':True},
  {'id':'s4','name':'Аренда с водителем','price':'по расчёту','description':'Автомобиль с персональным водителем.','active':True}],
 'qb_orders': [],
 'qb_drivers': [
  {'id':'d1','name':'Нурлан','phone':'+7 701 555 20 20','type':'Трезвый водитель','status':'Свободен','rating':4.9,'orders':38},
  {'id':'d2','name':'Арман','phone':'+7 707 441 11 10','type':'Такси / трансфер','status':'На заказе','rating':4.8,'orders':52},
  {'id':'d3','name':'Данияр','phone':'+7 775 900 40 40','type':'Аренда с водителем','status':'Свободен','rating':5.0,'orders':29}],
 'qb_notices': [
  {'id':'n1','name':'Бронь подтверждена','text':'Ваша бронь подтверждена. Автомобиль будет готов к указанному времени.','active':True},
  {'id':'n2','name':'Водитель назначен','text':'Водитель назначен и уже получил детали заказа.','active':True},
  {'id':'n3','name':'Напоминание об оплате','text':'Напоминаем об оплате заказа. Если уже оплатили — отправьте чек менеджеру.','active':True}],
 'qb_staff': [
  {'id':'u1','name':'Администратор','role':'Владелец','phone':'+7 775 275 70 63','access':'Полный доступ','active':True},
  {'id':'u2','name':'Диспетчер','role':'Менеджер','phone':'—','access':'Заказы, клиенты, водители','active':True}],
 'qb_expenses': [
  {'id':'e1','carId':'c3','carName':'Range Rover','type':'ТО','amount':85000,'date':'2026-09-05','comment':'Масло, фильтры, диагностика'},
  {'id':'e2','carId':'c1','carName':'Jaguar XJ','type':'Мойка / детейлинг','amount':18000,'date':'2026-09-08','comment':'Подготовка к аренде'}],
 'qb_maintenance': [
  {'id':'m1','carId':'c3','carName':'Range Rover','type':'Плановое ТО','date':'2026-09-14','mileage':74200,'cost':120000,'status':'Запланировано','comment':'Замена масла и фильтров'},
  {'id':'m2','carId':'c2','carName':'Jaguar F-Type','type':'Диагностика','date':'2026-09-20','mileage':51800,'cost':45000,'status':'Запланировано','comment':'Подвеска и тормозная система'}],
 'qb_fines': [],
 'qb_promos': [
  {'id':'p1','code':'BOSS10','type':'percent','value':10,'active':True,'uses':0,'limit':100,'expires':'2026-12-31'}],
 'qb_tariffs': [
  {'id':'t1','name':'Такси — город','base':1500,'perKm':250,'perMin':35,'minFare':2500,'active':True},
  {'id':'t2','name':'Трезвый водитель','base':5000,'perKm':300,'perMin':0,'minFare':7000,'active':True},
  {'id':'t3','name':'Межгород','base':0,'perKm':350,'perMin':0,'minFare':10000,'active':True}],
 'qb_driver_locations': [
  {'driverId':'d1','lat':47.0945,'lng':51.9238,'updated':'сейчас'},
  {'driverId':'d2','lat':47.1018,'lng':51.9072,'updated':'2 мин назад'},
  {'driverId':'d3','lat':47.0862,'lng':51.9360,'updated':'5 мин назад'}]
}

class State(db.Model):
    __tablename__ = 'state'
    key = db.Column(db.String(80), primary_key=True)
    value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Audit(db.Model):
    __tablename__ = 'audit'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(80))
    entity = db.Column(db.String(120))
    actor = db.Column(db.String(120), default='system')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='manager')
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ClientUser(db.Model):
    __tablename__ = 'client_users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(40), unique=True, nullable=False, index=True)
    email = db.Column(db.String(160), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_json = db.Column(db.Text, nullable=False, default='{}')
    favorites_json = db.Column(db.Text, nullable=False, default='[]')
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ClientCode(db.Model):
    __tablename__ = 'client_codes'
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(40), nullable=False, index=True)
    code_hash = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

ALLOWED_EXT = {'png','jpg','jpeg','webp'}

def actor():
    return session.get('admin_username') or session.get('client_phone') or 'anonymous'

def log(action, entity):
    db.session.add(Audit(action=action, entity=str(entity), actor=actor()))
    db.session.commit()

def put_key(key, value, action='sync'):
    if key not in DEFAULTS:
        return False
    row = db.session.get(State, key)
    raw = json.dumps(value, ensure_ascii=False)
    if row:
        row.value, row.updated_at = raw, datetime.utcnow()
    else:
        db.session.add(State(key=key, value=raw, updated_at=datetime.utcnow()))
    db.session.add(Audit(action=action, entity=key, actor=actor()))
    db.session.commit()
    return True

def get_state():
    out = {}
    for row in State.query.all():
        try: out[row.key] = json.loads(row.value)
        except Exception: out[row.key] = None
    return out

def parse_iso(v):
    try: return date.fromisoformat(v)
    except Exception: return None

def booking_conflict(orders, car_id, start, end, exclude_id=None):
    if not car_id or not start: return None
    s = parse_iso(start); e = parse_iso(end or start)
    if not s or not e: return None
    if e < s: s, e = e, s
    for o in orders:
        if exclude_id is not None and str(o.get('id')) == str(exclude_id): continue
        if str(o.get('carId','')) != str(car_id): continue
        if o.get('status') in ('Отменена','Завершена'): continue
        os_ = parse_iso(o.get('date','')); oe = parse_iso((o.get('extra') or {}).get('endDate') or o.get('date',''))
        if os_ and oe and max(s, os_) <= min(e, oe): return o
    return None

def admin_required(fn):
    @wraps(fn)
    def inner(*a, **kw):
        if not session.get('admin'): return jsonify(ok=False,error='Admin authentication required'),401
        return fn(*a, **kw)
    return inner

with app.app_context():
    db.create_all()
    for k,v in DEFAULTS.items():
        if not db.session.get(State,k): db.session.add(State(key=k,value=json.dumps(v,ensure_ascii=False),updated_at=datetime.utcnow()))
    username = os.getenv('ADMIN_USERNAME','admin')
    password = os.getenv('ADMIN_PASSWORD','QazaqBoss2026!')
    if not AdminUser.query.filter_by(username=username).first():
        db.session.add(AdminUser(username=username,password_hash=generate_password_hash(password),role='owner',active=True))
    db.session.commit()

@app.get('/api/health')
def health():
    kind = 'postgresql' if 'postgresql' in app.config['SQLALCHEMY_DATABASE_URI'] else 'sqlite'
    return jsonify(ok=True,database=kind,time=datetime.utcnow().isoformat()+'Z',version='18.0-clean')

@app.get('/api/public-state')
def public_state():
    st=get_state()
    return jsonify({k:st.get(k,DEFAULTS[k]) for k in ('qb_settings','qb_cars_v2','qb_services')})

@app.get('/api/state')
@admin_required
def state(): return jsonify(get_state())

@app.get('/api/state/<key>')
@admin_required
def state_key(key):
    if key not in DEFAULTS: return jsonify(ok=False,error='Unsupported key'),404
    return jsonify(get_state().get(key, DEFAULTS[key]))

@app.put('/api/state/<key>')
@admin_required
def update_state_key(key):
    if key not in DEFAULTS: return jsonify(ok=False,error='Unsupported key'),404
    value=request.get_json(silent=True)
    if value is None: return jsonify(ok=False,error='JSON body required'),400
    put_key(key,value,'update_state')
    return jsonify(ok=True,key=key,value=value)


@app.post('/api/sync')
@admin_required
def sync():
    data=request.get_json(silent=True) or {}
    if not put_key(data.get('key'), data.get('value')): return jsonify(ok=False,error='Unsupported key'),400
    return jsonify(ok=True)

@app.get('/api/availability')
def availability():
    st=get_state(); car_id=request.args.get('car_id',''); start=request.args.get('start',''); end=request.args.get('end','')
    conflict=booking_conflict(st.get('qb_orders',[]),car_id,start,end)
    return jsonify(ok=True,available=not bool(conflict),conflict_id=(conflict or {}).get('id'))

@app.post('/api/orders')
def create_order():
    order=request.get_json(silent=True) or {}
    if not order.get('name') or not order.get('phone') or not order.get('service'):
        return jsonify(ok=False,error='name, phone and service required'),400
    st=get_state(); orders=st.get('qb_orders',[])
    if order.get('carId'):
        conflict=booking_conflict(orders, order.get('carId'), order.get('date'), (order.get('extra') or {}).get('endDate'))
        if conflict: return jsonify(ok=False,error='Автомобиль уже занят на выбранные даты',conflict_id=conflict.get('id')),409
    order.setdefault('id', int(datetime.utcnow().timestamp()*1000))
    order.setdefault('status','Новая'); order.setdefault('paymentStatus','Ожидается')
    order.setdefault('created',datetime.now().strftime('%d.%m.%Y, %H:%M'))
    orders.insert(0,order); put_key('qb_orders',orders,'create_order')
    return jsonify(ok=True,order=order),201

@app.patch('/api/orders/<order_id>')
@admin_required
def patch_order(order_id):
    data=request.get_json(silent=True) or {}; st=get_state(); orders=st.get('qb_orders',[])
    target=next((x for x in orders if str(x.get('id'))==str(order_id)),None)
    if not target: return jsonify(ok=False,error='Order not found'),404
    new={**target,**data}
    if new.get('carId'):
        conflict=booking_conflict(orders,new.get('carId'),new.get('date'),(new.get('extra') or {}).get('endDate'),exclude_id=order_id)
        if conflict: return jsonify(ok=False,error='Автомобиль уже занят на выбранные даты',conflict_id=conflict.get('id')),409
    target.clear(); target.update(new); put_key('qb_orders',orders,'update_order')
    return jsonify(ok=True,order=target)

@app.get('/api/orders')
@admin_required
def list_orders(): return jsonify(get_state().get('qb_orders',[]))

@app.post('/api/upload')
@admin_required
def upload():
    f=request.files.get('file')
    if not f or not f.filename: return jsonify(ok=False,error='File required'),400
    ext=f.filename.rsplit('.',1)[-1].lower() if '.' in f.filename else ''
    if ext not in ALLOWED_EXT: return jsonify(ok=False,error='Only PNG/JPG/JPEG/WEBP allowed'),400
    name=f'{uuid.uuid4().hex}.{ext}'; path=UPLOAD_DIR/name; f.save(path)
    log('upload_image',name)
    return jsonify(ok=True,url=f'/uploads/{name}')

@app.get('/uploads/<path:name>')
def uploaded(name): return send_from_directory(UPLOAD_DIR,secure_filename(name))

def clean_phone(v):
    return ''.join(ch for ch in str(v or '') if ch.isdigit() or ch=='+').strip()

def valid_phone(v):
    d=''.join(ch for ch in str(v or '') if ch.isdigit())
    return len(d) in (10,11) and (d.startswith('7') or len(d)==10)

def client_required(fn):
    @wraps(fn)
    def inner(*a, **kw):
        if not session.get('client_phone'): return jsonify(ok=False,error='Войдите в аккаунт'),401
        return fn(*a, **kw)
    return inner

@app.post('/api/client/register')
def client_register():
    data=request.get_json(silent=True) or {}
    name=str(data.get('name','')).strip(); phone=clean_phone(data.get('phone')); email=str(data.get('email','')).strip().lower() or None; password=str(data.get('password',''))
    if len(name)<2: return jsonify(ok=False,error='Введите имя'),400
    if not valid_phone(phone): return jsonify(ok=False,error='Введите корректный номер телефона'),400
    if len(password)<8 or not any(c.islower() for c in password) or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
        return jsonify(ok=False,error='Пароль: минимум 8 символов, заглавная, строчная буква и цифра'),400
    if ClientUser.query.filter_by(phone=phone).first(): return jsonify(ok=False,error='Этот номер уже зарегистрирован'),409
    if email and ClientUser.query.filter_by(email=email).first(): return jsonify(ok=False,error='Этот e-mail уже зарегистрирован'),409
    u=ClientUser(name=name,phone=phone,email=email,password_hash=generate_password_hash(password))
    db.session.add(u); db.session.commit(); session['client_phone']=phone
    log('client_register',phone)
    return jsonify(ok=True,user={'name':u.name,'phone':u.phone,'email':u.email}),201

@app.post('/api/client/login')
def client_login():
    data=request.get_json(silent=True) or {}; login=str(data.get('login','')).strip().lower(); password=str(data.get('password',''))
    phone=clean_phone(login)
    u=ClientUser.query.filter((ClientUser.phone==phone)|(ClientUser.email==login)).first()
    if not u or not u.active or not check_password_hash(u.password_hash,password): return jsonify(ok=False,error='Неверный телефон/e-mail или пароль'),401
    session['client_phone']=u.phone; log('client_login',u.phone)
    return jsonify(ok=True,user={'name':u.name,'phone':u.phone,'email':u.email})

@app.post('/api/client/logout')
def client_logout():
    session.pop('client_phone',None); return jsonify(ok=True)

@app.get('/api/client/account')
@client_required
def client_account():
    u=ClientUser.query.filter_by(phone=session['client_phone'],active=True).first()
    if not u: session.pop('client_phone',None); return jsonify(ok=False,error='Аккаунт не найден'),404
    try: profile=json.loads(u.profile_json or '{}')
    except: profile={}
    try: favorites=json.loads(u.favorites_json or '[]')
    except: favorites=[]
    return jsonify(ok=True,user={'name':u.name,'phone':u.phone,'email':u.email,'profile':profile,'favorites':favorites})

@app.patch('/api/client/account')
@client_required
def patch_client_account():
    data=request.get_json(silent=True) or {}; u=ClientUser.query.filter_by(phone=session['client_phone'],active=True).first()
    if not u: return jsonify(ok=False,error='Аккаунт не найден'),404
    if 'name' in data and len(str(data['name']).strip())>=2: u.name=str(data['name']).strip()
    if 'email' in data:
        email=str(data.get('email') or '').strip().lower() or None
        other=ClientUser.query.filter(ClientUser.email==email,ClientUser.id!=u.id).first() if email else None
        if other: return jsonify(ok=False,error='Этот e-mail уже используется'),409
        u.email=email
    if 'profile' in data: u.profile_json=json.dumps(data.get('profile') or {},ensure_ascii=False)
    if 'favorites' in data: u.favorites_json=json.dumps(data.get('favorites') or [],ensure_ascii=False)
    db.session.commit(); log('client_profile',u.phone)
    return jsonify(ok=True)

@app.get('/api/client/orders')
@client_required
def client_orders():
    phone=session['client_phone']; arr=[o for o in get_state().get('qb_orders',[]) if clean_phone(o.get('phone'))==clean_phone(phone)]
    return jsonify(arr)

@app.post('/api/client/request-code')
def request_code():
    from datetime import timedelta
    data=request.get_json(silent=True) or {}; phone=str(data.get('phone','')).strip()
    if len(phone)<7: return jsonify(ok=False,error='Некорректный номер'),400
    # Production hook: connect SMS provider here. In demo mode code is returned only when DEV_SMS=1.
    code=f'{secrets.randbelow(1000000):06d}'
    db.session.add(ClientCode(phone=phone,code_hash=generate_password_hash(code),expires_at=datetime.utcnow()+timedelta(minutes=5)))
    db.session.commit()
    payload={'ok':True,'message':'Код создан. Подключите SMS-провайдера для боевой отправки.'}
    if os.getenv('DEV_SMS','0')=='1': payload['dev_code']=code
    return jsonify(payload)

@app.post('/api/client/verify-code')
def verify_code():
    data=request.get_json(silent=True) or {}; phone=str(data.get('phone','')).strip(); code=str(data.get('code','')).strip()
    row=ClientCode.query.filter_by(phone=phone,used=False).order_by(ClientCode.id.desc()).first()
    if not row or row.expires_at < datetime.utcnow() or not check_password_hash(row.code_hash,code):
        return jsonify(ok=False,error='Неверный или просроченный код'),400
    row.used=True; db.session.commit(); session['client_phone']=phone
    return jsonify(ok=True,phone=phone)

@app.get('/api/client/me')
def client_me(): return jsonify(authenticated=bool(session.get('client_phone')),phone=session.get('client_phone'))


@app.get('/api/driver/<driver_id>/orders')
def driver_orders(driver_id):
    st=get_state(); orders=[o for o in st.get('qb_orders',[]) if str(o.get('driverId',''))==str(driver_id)]
    return jsonify(orders)

@app.patch('/api/driver/<driver_id>/status')
def driver_status(driver_id):
    data=request.get_json(silent=True) or {}; st=get_state(); ds=st.get('qb_drivers',[])
    d=next((x for x in ds if str(x.get('id'))==str(driver_id)),None)
    if not d: return jsonify(ok=False,error='Driver not found'),404
    status=data.get('status')
    if status not in ('Свободен','На заказе','Не на линии'): return jsonify(ok=False,error='Invalid status'),400
    d['status']=status; put_key('qb_drivers',ds,'driver_status')
    return jsonify(ok=True,driver=d)

@app.patch('/api/driver/<driver_id>/location')
def driver_location(driver_id):
    data=request.get_json(silent=True) or {}; lat=data.get('lat'); lng=data.get('lng')
    try: lat=float(lat); lng=float(lng)
    except Exception: return jsonify(ok=False,error='Invalid coordinates'),400
    if not (-90<=lat<=90 and -180<=lng<=180): return jsonify(ok=False,error='Invalid coordinates'),400
    st=get_state(); locs=st.get('qb_driver_locations',[]); row=next((x for x in locs if str(x.get('driverId'))==str(driver_id)),None)
    payload={'driverId':driver_id,'lat':lat,'lng':lng,'updated':datetime.utcnow().isoformat()+'Z'}
    if row: row.update(payload)
    else: locs.append(payload)
    put_key('qb_driver_locations',locs,'driver_location')
    return jsonify(ok=True,location=payload)

@app.get('/api/audit')
@admin_required
def audit():
    rows=Audit.query.order_by(Audit.id.desc()).limit(200).all()
    return jsonify([{'id':r.id,'action':r.action,'entity':r.entity,'actor':r.actor,'created_at':r.created_at.isoformat()} for r in rows])

@app.post('/api/reset-demo')
@admin_required
def reset_demo():
    for k,v in DEFAULTS.items(): put_key(k,v,'reset')
    return jsonify(ok=True)

@app.route('/admin-login', methods=['GET','POST'])
def admin_login():
    error=False
    if request.method=='POST':
        username=request.form.get('username') or os.getenv('ADMIN_USERNAME','admin')
        password=request.form.get('password','')
        u=AdminUser.query.filter_by(username=username,active=True).first()
        if u and check_password_hash(u.password_hash,password):
            session['admin']=True; session['admin_username']=u.username; session['admin_role']=u.role
            return redirect('/admin.html')
        error=True
    return send_from_directory(BASE,'admin_login.html'), (401 if error else 200)

@app.get('/api/admin/me')
def admin_me(): return jsonify(authenticated=bool(session.get('admin')),username=session.get('admin_username'),role=session.get('admin_role'))

@app.get('/logout')
def logout(): session.clear(); return redirect('/admin-login')

@app.get('/admin.html')
def admin_page():
    if os.getenv('REQUIRE_ADMIN','1')=='1' and not session.get('admin'): return redirect('/admin-login')
    return send_from_directory(BASE,'admin.html')

@app.get('/')
def home(): return send_from_directory(BASE,'index.html')

@app.get('/<path:path>')
def static_files(path): return send_from_directory(BASE,path)

if __name__=='__main__':
    app.run(host='0.0.0.0',port=int(os.getenv('PORT','5000')),debug=os.getenv('FLASK_DEBUG')=='1')
