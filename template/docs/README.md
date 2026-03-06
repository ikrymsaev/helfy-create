# Helfy

Helfy -- TypeScript UI-фреймворк с декоратор-ориентированным API, кастомным JSX и fine-grained reactivity.

Компоненты описываются классами с декоратором `@View`, состояние управляется через `@state` и `@observable`, а шаблоны используют расширенный JSX с директивами `@if`, `@for`, `@else`. Реактивность построена на signals (аналог SolidJS): `render()` вызывается один раз, а последующие обновления DOM происходят точечно — только для тех узлов, которые читают изменившийся signal.

## Содержание

- [Установка](#установка)
- [Компоненты](#компоненты)
  - [Базовый компонент](#базовый-компонент)
  - [Props](#props)
  - [Локальное состояние (@state)](#локальное-состояние-state)
  - [Вложенные компоненты](#вложенные-компоненты)
  - [Монтирование в DOM](#монтирование-в-dom)
  - [Привязка к DOM и компонентам (@ref)](#привязка-к-dom-и-компонентам-ref)
  - [Двустороннее связывание (@bind)](#двустороннее-связывание-bind)
  - [Формы (@Form, @field, @field в JSX)](#формы-form-field-field-в-jsx)
- [Шаблонные директивы](#шаблонные-директивы)
  - [@if / @elseif / @else](#if--elseif--else)
  - [@for](#for)
  - [@empty](#empty)
- [State Management](#state-management)
  - [Создание Store](#создание-store)
  - [Подписка через @observe](#подписка-через-observe)
  - [Контекст хранилищ](#контекст-хранилищ)
- [Логирование (@logger)](#логирование-logger)
- [Context & DI](#context--di)
  - [Провайдер (@Context, @provide)](#провайдер-context-provide)
  - [Потребитель (@ctx)](#потребитель-ctx)
  - [Реактивные поля](#реактивные-поля)
  - [Опциональная инжекция](#опциональная-инжекция)
  - [DI Container](#di-container-конструкторный-инжект)
- [JSX](#jsx)
  - [Атрибуты](#атрибуты)
  - [События](#события)
  - [Стили](#стили)
  - [CSS-классы](#css-классы)
- [API](#api)

---

## Установка

```bash
npm install @helfy/helfy
```

или в `package.json`:

```json
{
  "dependencies": {
    "@helfy/helfy": "^0.0.1"
  }
}
```

### Build setup

Babel-плагин автоматически запускает DI-сканер перед трансформацией (pre-скрипты в `package.json` не нужны). Сканер генерирует `.helfy/di-tokens.ts`, `.helfy/di-registry.ts`. Добавьте `.helfy` в `.gitignore`.

### Babel

В `.babelrc` достаточно одного пресета:

```json
{
  "presets": ["@helfy/helfy/babel-preset"]
}
```

Пресет включает: JSX runtime, TypeScript, legacy-декораторы, class properties, babel-plugin-transform-typescript-metadata, **helfy-di** (compile-time DI для `@Injectable<IX>()`, автоинъекция регистрации при `createApp`, трансформация `@logger()` → `@logger("<ClassName>")`).

### Webpack

Для обработки директив (`@if`, `@for`, `@ref`, `@bind`, `@field`) в `.tsx` файлах подключить loader:

```javascript
{
  test: /\.tsx$/,
  use: [
    'babel-loader',
    require.resolve('@helfy/helfy/compiler/helfy-loader'),
  ],
}
```

### TypeScript

В `tsconfig.json` указать:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "plugins": [{ "name": "@helfy/helfy/ts-plugin" }]
  }
}
```

Плагин `@helfy/helfy/ts-plugin` даёт поддержку директив `@if`, `@for`, `@ref`, `@bind`, `@field` в IDE (автодополнение, типизация, переход к определению). Идёт в комплекте с пакетом helfy.

---

## Компоненты

### Базовый компонент

Компонент -- это класс с декоратором `@View` и методом `render()`, возвращающим JSX:

```tsx
import { View } from "@helfy/helfy";

@View
class Hello {
    render() {
        return (
            <div>
                <h1>Hello, Helfy!</h1>
            </div>
        );
    }
}
```

Декоратор `@View` автоматически:
- вызывает `render()` **один раз** и монтирует результат в DOM-фрагмент
- добавляет свойство `view` (ссылка на корневой DOM-элемент)
- оборачивает `this.props` в реактивный Proxy (каждый prop — signal)
- настраивает fine-grained эффекты: при изменении signal обновляется только конкретный DOM-узел, а не весь компонент

> **Важно:** При наследовании `@View` нужно указывать и на дочернем классе. Без этого не будут работать `@ctx`, `scheduleUpdate` и обновление DOM.

### Props

Props передаются через конструктор. Декоратор `@View` оборачивает `this.props` в реактивный Proxy — каждый prop становится signal. Это означает, что при изменении props родителем обновляются только те DOM-узлы, которые их читают, без полного перерендера компонента.

> **Важно:** Не деструктуризируйте `this.props` в `render()`. Обращайтесь к полям напрямую через `this.props.field` — это обеспечивает корректную подписку на signals.

```tsx
import { View } from "@helfy/helfy";

interface ButtonProps {
    label: string;
    type?: "button" | "submit";
    onClick?: () => void;
}

@View
class Button {
    constructor(private readonly props: ButtonProps) {}

    render() {
        return (
            <button
                type={this.props.type ?? "button"}
                onclick={this.props.onClick}
            >
                {this.props.label}
            </button>
        );
    }
}
```

Использование:

```tsx
<Button label="Нажми" onClick={() => console.log('clicked')} />
```

При изменении props родителем `updateProps()` обновляет соответствующие signals через `batch()`. Fine-grained эффекты, созданные Babel-плагином (`createReactiveChild`), отслеживают эти signals и точечно обновляют DOM.

### Локальное состояние (@state)

Декоратор `@state` делает поле реактивным — под капотом каждое поле — это signal из `createSignal()`.  
При изменении значения обновляются только те DOM-узлы и эффекты, которые читают это поле (fine-grained). Полный перерендер компонента не происходит:

```tsx
import { View, state } from "@helfy/helfy";

@View
class Counter {
    @state private count = 0;

    increment() {
        this.count++; // обновит только узлы, читающие count
    }

    decrement() {
        this.count--;
    }

    render() {
        return (
            <div>
                <span>{this.count}</span>
                <button onclick={this.increment.bind(this)}>+</button>
                <button onclick={this.decrement.bind(this)}>-</button>
            </div>
        );
    }
}
```

Можно объявить несколько `@state`-полей. Каждое из них независимо триггерит обновление только тех узлов DOM, которые его читают.

Signals‑примитивы (`createSignal`, `createEffect`, `createComputed`, `batch`, `onCleanup`) также экспортируются из `helfy` и могут использоваться напрямую, но в большинстве случаев достаточно `@state`, `@computed` и `@effect`.

### Вложенные компоненты

Компоненты используются в JSX как теги. Props передаются как атрибуты:

```tsx
import { View } from "@helfy/helfy";

@View
class App {
    render() {
        return (
            <div>
                <Counter />
                <Button label="Hello" onClick={() => {}} />
            </div>
        );
    }
}
```

### Монтирование в DOM

Корневой компонент монтируется через `attach()`, чтобы вызвать хук `onAttached()` (после вставки в document):

```typescript
const app = new App();
app.attach(document.getElementById('root'));
```

### Привязка к DOM и компонентам (@ref)

Декоратор `@ref` помечает поле для получения ссылки на DOM-элемент или экземпляр компонента. В JSX используется директива `@ref(this.имяПоля)`. Доступ к ссылке возможен после `onMount()`. Для операций вроде `focus()`, требующих элемент в document, используйте `onAttached()`.

**Для компонентов** — родитель получает прокси с доступом только к методам, помеченным `@expose`. Это позволяет явно определить публичный API компонента.

```tsx
import { View, ref, expose } from "@helfy/helfy";

@View
class Input {
    @ref private inputEl!: HTMLInputElement;

    @expose focus() {
        this.inputEl?.focus();
    }

    render() {
        return <input @ref(this.inputEl) type="text" />;
    }
}

@View
class Form {
    @ref private input!: Input;

    onAttached() {
        this.input.focus();  // доступен только помеченный метод
    }

    render() {
        return <Input @ref(this.input) />;
    }
}
```

- DOM-элементы по `@ref` передаются как есть
- Компоненты с `@expose` — родитель видит только помеченные методы
- Компоненты без `@expose` — передаётся экземпляр целиком (обратная совместимость)

При условном рендере (`@if`) ссылка обнуляется при удалении элемента. Запрещено использовать `@ref` и `@state` на одном поле.

### Двустороннее связывание (@bind)

Директива `@bind` — синтаксический сахар для двусторонней привязки значения поля `@state` к элементу формы. Синтаксис: `@bind(expr)` — круглые скобки, как у `@ref`. Компилятор автоматически генерирует пару `value`/`checked` и обработчик события.

```tsx
import { View, state } from "@helfy/helfy";

@View
class LoginForm {
    @state private username = '';
    @state private email = '';
    @state private isActive = true;

    render() {
        return (
            <form>
                <input @bind(this.username) type="text" />
                <input @bind(this.email) type="email" />
                <input @bind(this.isActive) type="checkbox" />
                <select @bind(this.priority)>
                    <option value="low">Низкий</option>
                    <option value="high">Высокий</option>
                </select>
            </form>
        );
    }
}
```

Трансформация по типу элемента:

| Элемент | Атрибут | Событие |
|---------|---------|---------|
| `input[text|email|password|...]` | `value` | `oninput` |
| `input[checkbox|radio]` | `checked` | `onchange` |
| `select` | `value` | `onchange` |
| `textarea` | `value` | `oninput` |

Поле должно быть помечено `@state` для реактивного обновления UI. Для union-типов (например, `TodoPriority`) используется приведение `as typeof expr` — типобезопасность сохраняется.

**Кастомные компоненты:** для привязки к компоненту с пропом `value` используется именованный биндинг `@bind:value(expr)`:

```tsx
// Родитель
<Input @bind:value(this.title) placeholder="Заголовок" />

// Компонент Input с @binded("value")
@View
class Input {
  @binded("value") private bindedVal!: string;
  // ...
  render() {
    return <input @bind(this.bindedVal) type="text" />;
  }
}
```

### Формы (@Form, @field, @field в JSX)

Централизованное управление формами с валидацией через контекст: `@Form` — класс контекста формы, `@field` — декоратор полей (создаёт `FieldState`), `@useForm` — инжект формы в компонент. JSX-директива `@field(expr)` подключает инпут к `FieldState` одной строкой.

**FormContext** — класс с `@Form` и полями `@field`:

```tsx
import { Form, field, logger, type FieldState, type ILogger } from "@helfy/helfy";

@Form
export class LoginFormContext {
  @logger() private log!: ILogger;

  @field({ defaultValue: "" })
  email!: FieldState<string>;

  @field({ defaultValue: "" })
  password!: FieldState<string>;

  @field({ defaultValue: false })
  rememberMe!: FieldState<boolean>;

  validateAll(): boolean {
    // проверка полей, установка field.error
    return true;
  }

  submit() {
    if (!this.validateAll()) {
      this.log.warn("Submit validation failed");
      return;
    }
    this.log.info("Submit", { email: this.email.value });
  }
}
```

**FieldState** содержит `value`, `isDirty`, `isTouched`, `error`, `isValid`. При изменении `value`/`error`/`isTouched` компоненты с `@useForm` перерендериваются.

**Компонент формы** — инжект через `@useForm`, рендер через провайдер:

```tsx
import { View, useForm } from "@helfy/helfy";
import { LoginFormContext } from "./LoginFormContext";

@View
export class LoginForm {
  @useForm(LoginFormContext) private form!: LoginFormContext;

  render() {
    return (
      <LoginFormContext>
        <form onsubmit={(e: Event) => { e.preventDefault(); this.form.submit(); }}>
          <input @field(this.form.email) type="email" class="input" />
          {this.form.email.isTouched && this.form.email.error && (
            <span class="error">{this.form.email.error}</span>
          )}
          <input @field(this.form.password) type="password" class="input" />
          <input @field(this.form.rememberMe) type="checkbox" id="remember" />
          <label for="remember">Запомнить меня</label>
          <button type="submit">Войти</button>
        </form>
      </LoginFormContext>
    );
  }
}
```

**JSX-директива `@field(expr)`** — одна директива заменяет `@bind` + `onblur` + `class` для ошибок + `aria-invalid`. Компилятор генерирует:

- `value`/`checked` и `oninput`/`onchange`
- `onblur` → `expr.isTouched = true`
- `class` — объединение с существующим; при `expr.isTouched && expr.error` добавляется `input-error`
- `aria-invalid={expr.isTouched && expr.error ? "true" : "false"}`

Поддерживаются `input` (text, email, password, checkbox, radio), `select`, `textarea`. Класс `.input-error` можно задать в глобальных стилях (например, `@apply border-red-500` в Tailwind).

---

## Шаблонные директивы

Helfy расширяет JSX директивами `@if`, `@elseif`, `@else`, `@for`, `@empty`. Компилятор трансформирует их в вызовы `$._if()`, `$._ifelse()`, `$._forin()` на этапе сборки.

### @if / @elseif / @else

Условный рендеринг:

```tsx
render() {
    return (
        <div>
            @if (this.count > 0) {
                <span>Положительное: {this.count}</span>
            }
        </div>
    );
}
```

Цепочка условий:

```tsx
render() {
    return (
        <div>
            @if (this.status === 'loading') {
                <span>Загрузка...</span>
            } @elseif (this.status === 'error') {
                <span>Ошибка!</span>
            } @else {
                <span>Данные загружены</span>
            }
        </div>
    );
}
```

Вложенные условия:

```tsx
@if (this.isVisible) {
    <div>
        @if (this.count > 10) {
            <span>Больше десяти</span>
        }
    </div>
}
```

### @for

Итерация по массиву. Синтаксис: `@for (item of array)` или `@for (item, index of array)`.

```tsx
@state private items = ['apple', 'banana', 'cherry'];

render() {
    return (
        <ul>
            @for (item, i of this.items; track item) {
                <li>{i}: {item}</li>
            }
        </ul>
    );
}
```

`track` задает ключ для оптимизации DOM-диффинга (аналог `key` в React):

```tsx
@for (user of this.users; track user.id) {
    <UserCard name={user.name} />
}
```

### @empty

Блок `@empty` после `@for` рендерится, когда массив пуст:

```tsx
@for (item of this.items; track item) {
    <div>{item}</div>
} @empty {
    <span>Список пуст</span>
}
```

---

## State Management

### Создание Store

Store -- глобальное реактивное хранилище. Создается классом с декоратором `@Store`, реактивные поля помечаются `@observable`:

```typescript
import { Store, observable } from "@helfy/helfy";

@Store
class UserStore {
    @observable name = "Guest";
    @observable isLoggedIn = false;

    login(name: string) {
        this.name = name;
        this.isLoggedIn = true; // подписчики name и isLoggedIn уведомлены
    }

    logout() {
        this.name = "Guest";
        this.isLoggedIn = false;
    }
}

export default UserStore;
```

Декоратор `@Store` добавляет классу:
- `subscribe(field, callback)` -- подписка на изменение поля, возвращает функцию отписки
- `unsubscribe(field, callback)` -- отписка

Декоратор `@observable` превращает поле в реактивное свойство с getter/setter. При записи нового значения все подписчики уведомляются.

### Подписка через @observe

Декоратор `@observe` связывает поле компонента с полем store. При изменении значения в store компонент автоматически перерендерится:

```tsx
import { View, observe } from "@helfy/helfy";
import Stores from "./StoreContext";
import UserStore from "./UserStore";

@View
class Header {
    @observe(Stores.userStore, 'name')
    private userName: UserStore['name'];

    @observe(Stores.userStore, 'isLoggedIn')
    private isLoggedIn: UserStore['isLoggedIn'];

    render() {
        return (
            <header>
                @if (this.isLoggedIn) {
                    <span>Привет, {this.userName}!</span>
                } @else {
                    <span>Войдите в систему</span>
                }
            </header>
        );
    }
}
```

Тип поля берется из store через lookup-тип (`UserStore['name']`), что дает полную типобезопасность.

### Контекст хранилищ

Рекомендуется создать единый контекст для всех store:

```typescript
import UserStore from "./UserStore";
import AppStore from "./AppStore";

class Stores {
    static readonly userStore = new UserStore();
    static readonly appStore = new AppStore();
}

export default Stores;
```

Использование в компонентах:

```tsx
import Stores from "./StoreContext";

// подписка через декоратор
@observe(Stores.userStore, 'name')
private userName: string;

// прямой вызов метода store
Stores.userStore.login("Alice");
```

---

## Логирование (@logger)

Декоратор `@logger` инжектирует логгер в классы View, Context, Store и Injectable. Имя класса подставляется на этапе компиляции (Babel-плагин), что сохраняет читаемые имена даже при минификации.

### Использование

```tsx
import { View, logger, type ILogger } from "@helfy/helfy";

@View
class TodoInput {
  @logger() private log!: ILogger;   // auto: <TodoInput>

  onAttached() {
    this.log.debug("todo input attached");
    this.log.info("todo added", { title: this.title });
    this.log.warn("validation failed", { error: result.error });
  }
}
```

**Варианты:**
- `@logger()` — имя класса подставляется на compile-time как `<ClassName>`, формат и цвет зависят от типа класса
- `@logger("my-tag")` — кастомный тег, серый цвет

### Формат и цвет тегов по типу класса

| Тип | Формат | Цвет |
|-----|--------|------|
| View (компоненты) | `<TodoInput>` | skyblue |
| Injectable (сервисы) | `TodoValidateService()` | pink |
| Context | `{TodoContext}` | khaki |
| Form | `[LoginFormContext]` | bright blue |
| Store | `TodoStore[]` | lime green |
| Кастомный `@logger("...")` | как указано | gray |

### API логгера

```typescript
interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(messageOrError: string | Error, meta?: Record<string, unknown>): void;
  withContext(ctx: string): ILogger;  // дочерний логгер с доп. префиксом
}
```

### DI и транспорты

`LoggerService` регистрируется под `ILoggerToken` при `registerAllServices`. Можно подключить кастомные транспорты (Sentry, файл и т.д.), реализующие `ILogTransport`:

```typescript
import { LoggerService, ConsoleTransport, ILoggerToken } from "@helfy/helfy";

const transports = [new ConsoleTransport(), /* mySentryTransport */];
createApp({ root })
  .configureContainer((c) => {
    c.bind(ILoggerToken, { useClass: LoggerService, deps: [transports] });
  })
  .mount(App);
```

Без зарегистрированного логгера в контейнере используется fallback с выводом в `console`.

---

## Context & DI

Helfy поддерживает иерархический Context и Dependency Injection: провайдер оборачивает поддерево в JSX, а дочерние компоненты получают значения через `@ctx`. Это удобно для темы, форм, роутинга и других общих зависимостей.

### Провайдер (@Context, @provide)

Класс с декоратором `@Context` — не-рендерящий провайдер: он не имеет `render()` и рендерит только своих детей. Поля с `@provide` становятся доступны потребителям ниже по дереву.

```tsx
import { Context, provide } from "@helfy/helfy";

export type TThemeMode = "light" | "dark";

@Context
export class ThemeContext {
  @provide({ reactive: true })
  mode: TThemeMode = "dark";

  @provide()
  toggle = () => {
    this.mode = this.mode === "dark" ? "light" : "dark";
  };
}
```

Использование в JSX — обёртка вокруг поддерева:

```tsx
<ThemeContext>
  <Header />
  <Main />
</ThemeContext>
```

Фреймворк рендерит только детей `ThemeContext`; сам провайдер не создаёт DOM-узлов.

### Потребитель (@ctx)

Компонент с `@View` может получать значение контекста через `@ctx`:

```tsx
import { View, ctx } from "@helfy/helfy";
import { ThemeContext } from "./ThemeContext";

@View
class ThemeToggle {
  @ctx(ThemeContext)
  private theme!: ThemeContext;

  render() {
    return (
      <button onclick={this.theme.toggle}>
        {this.theme.mode === "dark" ? "Светлая тема" : "Тёмная тема"}
      </button>
    );
  }
}
```

Можно инжектировать только поле контекста:

```tsx
@View
class ModeDisplay {
  @ctx(ThemeContext, "mode")
  private mode!: TThemeMode;

  render() {
    return <span>Текущая тема: {this.mode}</span>;
  }
}
```

Поиск провайдера идёт вверх по дереву (`_parentView`); используется ближайший провайдер с нужным ключом.

### Реактивные поля

`@provide({ reactive: true })` делает поле реактивным: при изменении все потребители перерендериваются (под капотом используется `subscribe`). Для методов достаточно `@provide()` без `reactive`.

### Опциональная инжекция

Третий аргумент `@ctx` — опции `{ optional?, defaultValue? }`:

```tsx
@ctx(ThemeContext, { optional: true })
private theme?: ThemeContext;

@ctx(ThemeContext, "mode", { defaultValue: "light" })
private mode = "light";
```

Без провайдера в дереве `optional: true` даёт `undefined`; `defaultValue` используется, когда провайдера нет.

### DI Container (конструкторный инжект)

Helfy поддерживает DI-контейнер для глобальных сервисов с **compile-time** магией: сервисы помечаются `@Injectable<IX>()`, потребители указывают только тип в конструкторе — без `@inject` и явных токенов.

**Конвенция:** последний параметр конструктора — props от родителя; предшествующие параметры резолвятся из контейнера или из @Context по дереву.

**Сервис** — обязательно `@Injectable<IX>()` (интерфейс в generic):

```typescript
export interface ITodoValidateService {
  validate(title: string): ValidationResult;
}

@Injectable<ITodoValidateService>()
export class TodoValidateService implements ITodoValidateService {
  validate(title: string) { ... }
}
```

**Потребитель** — только тип в конструкторе (плагин подставляет токен):

```tsx
@View
class TodoInput {
  constructor(
    private readonly validateService: ITodoValidateService,
    readonly props: Props
  ) {}
}
```

**Bootstrap** — регистрация DI подключается автоматически при `createApp` (плагин подставляет `.useDI(registerAllServices)` в цепочку):

```typescript
createApp({ root: document.getElementById("root")! })
  .router({ routes })
  .mount(App);
```

Сканер вызывается Babel-плагином перед трансформацией, находит все `@Injectable<IX>()`, генерирует `.helfy/di-tokens.ts` и `.helfy/di-registry.ts`.

**Fallback** — для ручной настройки доступны `.configureContainer()`, `@inject(token)`, `@Injectable(token)`:

```typescript
createApp({ root })
  .configureContainer((c) => {
    c.bind(HttpClient, { useClass: AxiosHttpClient });
    c.autoRegister(SomeService);
  })
  .router({ routes })
  .mount(App);
```

Опционально: передать свой контейнер через `.container(myContainer)` или `createApp({ root, container })`.

`@Context` и контейнер сосуществуют: Context — для tree-scoped значений (тема, роутер), Container — для глобальных сервисов.

---

## JSX

Helfy использует кастомный JSX runtime (`@helfy/helfy/jsx-runtime`). JSX транслируется в вызовы `jsx()` / `jsxs()`, которые строят виртуальное представление DOM.

### Атрибуты

Стандартные HTML-атрибуты передаются напрямую:

```tsx
<input type="text" placeholder="Введите имя" />
<img src="/logo.png" alt="Logo" />
<div id="container" class="wrapper"></div>
```

### События

Обработчики событий передаются через атрибуты в **нижнем регистре** (`onclick`, `oninput`, а не `onClick`):

```tsx
<button onclick={() => this.increment()}>+</button>
<input oninput={(e) => this.handleInput(e)} />
```

### Стили

Инлайн-стили передаются объектом с camelCase-ключами:

```tsx
<div style={{
    backgroundColor: '#f0f0f0',
    fontSize: '16px',
    padding: '8px 16px',
    borderRadius: '4px'
}}>
    Стилизованный блок
</div>
```

### CSS-классы

Атрибут `class` принимает строку или массив с условными классами:

```tsx
// строка
<div class="container">...</div>

// CSS Modules
import styles from './App.module.css';
<div class={styles.wrapper}>...</div>

// условные классы через массив
<div class={[
    styles.cell,
    [styles.active, this.isActive],     // применяется если this.isActive === true
    [styles.disabled, this.isDisabled],
]}>...</div>
```

---

## API

### Декораторы

| Декоратор | Область | Описание |
|-----------|---------|----------|
| `@View` | Класс | Превращает класс в компонент с `render()`, `view`, `update()` |
| `@state` | Поле | Локальное состояние компонента на базе signals (запись обновляет только этот компонент) |
| `@Store` | Класс | Добавляет `subscribe`/`unsubscribe` и реактивность `@observable`-полей |
| `@observable` | Поле | Делает поле store реактивным -- запись уведомляет подписчиков |
| `@observe(store, field)` | Поле | Связывает поле компонента с полем store |
| `@Context` | Класс | Не-рендерящий провайдер контекста; рендерит только детей |
| `@provide()` / `@provide({ reactive: true })` | Поле | Помечает поле как доступное для `@ctx` (reactive — потребители перерендериваются) |
| `@ctx(ContextClass)` / `@ctx(ContextClass, field)` | Поле | Инжектирует контекст или поле контекста из ближайшего провайдера вверх по дереву |
| `@Injectable<IX>()` / `@Injectable<IX>('singleton' \| 'transient' \| 'scoped')` / `@Injectable(token)` | Класс | Помечает класс как injectable. Scope в (): `'singleton'` (по умолчанию), `'transient'`, `'scoped'`. Fallback: `@Injectable(token)` с Symbol/строкой |
| `@inject(token)` | Параметр конструктора | Задаёт токен для параметра (fallback; при `@Injectable<IX>()` плагин подставляет токен автоматически) |
| `@logger()` / `@logger("tag")` | Поле | Инжектирует ILogger. Без аргумента — compile-time имя класса и цвет по типу (View/Context/Store/Injectable). С аргументом — кастомный тег (серый) |
| `@ref` | Поле | Помечает поле для получения ссылки на DOM или компонент (использовать с `@ref(this.имяПоля)` в JSX) |
| `@binded(name)` | Поле | Связывает поле с биндингом `@bind:name` от родителя (для кастомных компонентов) |
| `@bind(expr)` / `@bind:name(expr)` | JSX | Двустороннее связывание с `@state` полем (value/checked + oninput/onchange). Для компонентов: `@bind:value(expr)` |
| `@Form` | Класс | Контекст формы с полями `@field` |
| `@field(options)` | Поле FormContext | Создаёт FieldState для поля формы (value, isTouched, error, isDirty) |
| `@useForm(FormContext)` | Поле | Инжектирует форму в компонент с подпиской на изменения полей |
| `@field(expr)` | JSX | Подключает инпут к FieldState: value/checked + onblur + error class + aria-invalid |

### Экспорты пакета

```typescript
import {
  $,               // утилиты рендеринга ($._if, $._ifelse, $._forin, $._slot, $._callSlot)
  View,            // декоратор @View
  state,           // декоратор @state (signal-backed локальное состояние)
  Store,           // декоратор @Store
  observable,      // декоратор @observable
  observe,         // декоратор @observe
  computed,        // @computed для Store/@Context/@View (getter-based)
  effect,          // @effect для реактивных сайд-эффектов во View
  Context,         // декоратор @Context
  provide,         // декоратор @provide
  ctx,             // декоратор @ctx (поле, Context)
  Container,       // DI-контейнер
  Injectable,      // декоратор @Injectable
  inject,          // декоратор @inject (параметр конструктора)
  createViewInstance,
  setRootContainer,
  getRootContainer,
  ref,             // декоратор @ref
  binded,          // декоратор @binded (для компонентов с @bind:value)
  Form,            // декоратор @Form (контекст формы)
  field,           // декоратор @field (поле FormContext)
  useForm,         // декоратор @useForm (инжект формы)
  type FieldState,
  type FieldOptions,
  StoreBase,       // базовый класс Store (для расширения)
  Subscriber,      // тип callback-подписчика
  Router,          // ядро роутера (Router)
  RouterContext,   // контекст роутера для дерева компонентов
  RouterView,      // компонент, рендерящий текущий маршрут
  Link,            // SPA-ссылка
  DefaultNotFound, // fallback-компонент 404 (используется RouterView при отсутствии слота)
  path,            // @path() — декоратор для pathname
  search,          // @search() — декоратор для query-параметров
  params,          // @params() — декоратор для route-параметров
  router,          // @router() — декоратор для API роутера
  logger,          // @logger() — декоратор для ILogger
  LoggerService,   // реализация ILogger (DI)
  ConsoleTransport,
  ILoggerToken,
  // primitives для fine-grained reactivity
  createSignal,
  createEffect,
  createComputed,
  batch,
  onCleanup,
  type Signal,
  type SignalGetter,
  type SignalSetter,
  type EffectDisposer,
  type RouteConfig,
  type RouterLocation,
  type ILogger,
  type ILogTransport,
  type LogLevel,
} from "@helfy/helfy";
```

### Subpath-экспорты

| Путь | Назначение |
|------|------------|
| `helfy` | Основной API (декораторы, $, типы) |
| `@helfy/helfy/router` | Тот же API роутера, но отдельным entry (для tree-shaking) |
| `@helfy/helfy/jsx-runtime` | JSX runtime (`jsx`, `jsxs`) |
| `@helfy/helfy/compiler/helfy-loader` | Webpack-loader для директив `@if`/`@for`/`@ref`/`@bind`/`@field` |
| `@helfy/helfy/babel-preset` | Babel-пресет (JSX, TypeScript, декораторы) |

### Роутинг (SPA)

Helfy включает лёгкий SPA‑роутер, построенный на `Context & DI`:

```tsx
import {
  View,
  RouterContext,
  RouterView,
  Link,
  type RouteConfig,
  type RouterLocation,
  ctx,
} from "@helfy/helfy";

// Конфиг маршрутов
const routes: RouteConfig[] = [
  { path: "/", component: HomePage },
  { path: "/analytics", component: AnalyticsPage },
  { path: "/settings", component: SettingsPage },
  { path: "/debug/:id", component: DebugPage },
];

@View
class App {
  render() {
    return (
      <RouterContext routes={routes}>
        <Layout>
          @slot.sidebar() {<Sidebar />}
          @slot.content() {<RouterView />}
        </Layout>
      </RouterContext>
    );
  }
}

@View
class Sidebar {
  @ctx(RouterContext, "location")
  private location!: RouterLocation;

  render() {
    const pathname = this.location.pathname;
    const isHome = pathname === "/";
    const isAnalytics = pathname.startsWith("/analytics");

    return (
      <nav>
        <Link
          to="/"
          label="Главная"
          class={isHome ? "font-bold" : ""}
        />
        <Link
          to="/analytics"
          label="Аналитика"
          class={isAnalytics ? "font-bold" : ""}
        />
      </nav>
    );
  }
}
```

Типичный компонент‑страница может использовать утилитарные декораторы роутера:

```tsx
import { View, path, search, params, router, type RouterAPI } from "@helfy/helfy";

@View
class DebugPage {
  @path()
  private pathname!: string;

  @params()
  private routeParams!: Record<string, string>;

  @search()
  private query!: Record<string, string>;

  @router()
  private rtr!: RouterAPI;

  render() {
    return (
      <section>
        <h1>Debug</h1>
        <pre>pathname: {this.pathname}</pre>
        <pre>params: {JSON.stringify(this.routeParams)}</pre>
        <pre>query: {JSON.stringify(this.query)}</pre>
        <button onclick={() => this.rtr.push("/analytics")}>
          Перейти в аналитику
        </button>
      </section>
    );
  }
}
```

Под капотом:

- `Router` использует `history.pushState/replaceState` и `popstate` для синхронизации с URL.
- `RouterContext` хранит реактивное `location` (`@provide({ reactive: true })`), так что `@ctx(RouterContext, "location")` и декораторы `@path/@search/@params/@router` автоматически триггерят перерендер компонентов при смене маршрута.
- `RouterView` сопоставляет текущий `pathname` с `RouteConfig` (в том числе с параметрами `:id` и вложенными маршрутами) и рендерит нужный `@View`‑класс. При отсутствии совпадения показывается `DefaultNotFound` или содержимое слота `@slot.notFound`.
- `Link` перехватывает `click`, не перезагружает страницу и вызывает `router.push/replace`, сохраняя поведение обычных ссылок (`href` остаётся).

**Кастомная страница 404.** Оберните `RouterView` и переопределите слот `notFound`:

```tsx
@View
class AppRouter {
  render() {
    return (
      <RouterView>
        @slot.notFound({ pathname }) {
          <MyNotFound pathname={pathname} />
        }
      </RouterView>
    );
  }
}
``` 

### Жизненный цикл компонента

1. `constructor(props)` -- создание экземпляра, `this.props` оборачивается в реактивный Proxy
2. `render()` -- возврат JSX (**вызывается один раз** при монтировании; Babel-плагин оборачивает выражения в `createReactiveChild` для fine-grained обновлений)
3. `mount()` -- первичный рендер JSX в DOM-фрагмент
4. `onMount()` -- хук после первого монтирования (опциональный)
5. `onAttached()` -- хук после вставки в document (опциональный). Вызывается при `attach(parent)`.
6. `update()` -- структурное обновление (при смене корневого компонента, например при роутинге). Для одного и того же дочернего компонента обновляются только signals через `updateProps`
7. `updateProps(newProps)` -- обновление prop-signals через `batch()` (fine-grained, без полного перерендера)

#### onMount vs onAttached

| | `onMount()` | `onAttached()` |
|---|---|---|
| **Когда** | Сразу после `mount()`, дерево построено, рефы назначены | После `attach(parent)`, элемент в document |
| **Элемент в document** | Может быть ещё нет (корень в fragment) | Да |
| **Рефы** | Доступны | Доступны |

**`onMount()`** — для инициализации, не требующей document:
- Подписки на store/observable/сервисы
- Настройка внутреннего состояния
- Добавление обработчиков (работают и на detached-узлах)

**`onAttached()`** — для операций, требующих элемент в document:
- `focus()`, `scrollIntoView()`
- `getBoundingClientRect()`, замер layout
- Любые DOM API, работающие только с подключённым узлом

```tsx
@View
class SearchInput {
  @ref private input!: HTMLInputElement;

  onMount() {
    this.store.subscribe(this.handleChange);  // подписка — document не нужен
  }

  onAttached() {
    this.input.focus();  // фокус — нужен document
  }
}
```

### Утилиты рендеринга ($)

Компилятор трансформирует директивы в вызовы `$`, но их можно использовать и напрямую.

**Статические** (условие вычисляется один раз):

```tsx
import { $ } from "@helfy/helfy";

render() {
    return (
        <div>
            {$._if(this.visible, <span>Видно</span>)}
            {$._ifelse(this.count > 0,
                <span>Положительное</span>,
                <span>Отрицательное или ноль</span>
            )}
            {$._forin(this.items, (item, index) => (
                <div $_key={item.id}>{index}: {item.name}</div>
            ))}
        </div>
    );
}
```

**Реактивные** (условие и ветки — thunks, пересчитываются при изменении signals):

```tsx
{$._rIf(() => this.visible, () => <span>Видно</span>)}
{$._rIfElse(() => this.count > 0,
    () => <span>Положительное</span>,
    () => <span>Отрицательное или ноль</span>
)}
{$._rForin(() => this.items, (item, index) => (
    <div $_key={item.id}>{index}: {item.name}</div>
))}
```

Компилятор автоматически выбирает реактивный вариант (`_rIf`, `_rIfElse`, `_rForin`) при генерации кода из директив `@if` / `@for`.

### Слоты (content projection)

Helfy поддерживает именованные слоты с fallback‑содержимым и переопределением в дочерних компонентах.

#### Провайдер слота (`@View`‑компонент)

Слоты объявляются прямо в JSX через директиву `@slot:имя(...)` внутри `render()`:

```tsx
import { View } from "@helfy/helfy";

@View
class AppLayout {
    render() {
        return (
            <section class="layout">
                {/* Именованный слот header с fallback-разметкой */}
                @slot:header({ title: "Список задач" }) fallback {
                    <header class="mb-4">
                        <h1 class="text-2xl font-bold text-gray-900">
                            Список задач
                        </h1>
                    </header>
                }

                {/* Именованный слот content с fallback и директивой @if внутри */}
                @slot:content({ store: this.props.store, filtered: this.props.filtered, hasTodos: this.props.hasTodos }) fallback {
                    @if (this.props.hasTodos) {
                        <section class="pt-3 border-t border-gray-200 text-sm text-gray-600">
                            <p class="mb-1">
                                Всего задач: {this.props.store.todos.length}, активных: {this.props.store.activeCount},
                                завершённых: {this.props.store.completedCount}
                            </p>
                            <p>Фильтрованных к показу: {this.props.filtered.length}</p>
                        </section>
                    }
                }
            </section>
        );
    }
}
```

Правила для провайдера:

- `@slot:header({ ... })` — объявляет именованный слот `header` и вызывает его.
- Блок `fallback { ... }` (опциональный) задаёт разметку по умолчанию, если слот не переопределён.
- Внутри `fallback` можно использовать директивы `@if`, `@for` и обычный JSX.

#### Потребитель слота (override в JSX)

Переопределение слота в дочернем компоненте делается через `@slot.имя(...) { ... }` внутри JSX‑детей:

```tsx
@View
class TodoApp {
    render() {
        const store = this.store;
        const filtered = this.filteredTodos;

        return (
            <AppLayout
                user={store.user}
                store={store}
                filtered={filtered}
                hasTodos={this.hasTodos}
            >
                {/* Переопределяем слот header */}
                @slot.header({ title }) {
                    <header class="mb-5">
                        <h1 class="mb-4 text-2xl font-bold text-gray-900">
                            Задачи ({title})
                        </h1>
                        <TodoInput
                            placeholder="Добавить задачу…"
                            onSubmit={(text) => store.add(text)}
                        />
                    </header>
                }

                {/* Переопределяем слот content, внутри можно использовать @if/@for */}
                @slot.content({ store, filtered, hasTodos }) {
                    @if (hasTodos) {
                        <section class="pt-3 border-t border-gray-200">
                            <TodoList
                                todos={filtered}
                                onToggle={(id) => store.toggle(id)}
                                onRemove={(id) => store.remove(id)}
                            />
                            <TodoFooter
                                filter={this.filter}
                                activeCount={store.activeCount}
                                completedCount={store.completedCount}
                                summary={store.filterSummary}
                                onFilter={(f) => store.setFilter(f)}
                                onClearCompleted={() => store.clearCompleted()}
                            />
                        </section>
                    }
                }
            </AppLayout>
        );
    }
}
```

Кратко по синтаксису:

- `@slot:имя({ props }) fallback { FallbackJSX }` — объявление и вызов слота в провайдере.
- `@slot.имя({ ctx }) { OverrideJSX }` — переопределение слота в потребителе.
- Внутри `FallbackJSX` и `OverrideJSX` поддерживаются все директивы (`@if`, `@for`, `@empty`) и обычный JSX.
