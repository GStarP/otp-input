# OTP Input

An input component for entering one-time password.

## Quick Start

Your project should use [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/docs/installation). Frontend framework (like React.js or Vue.js) doesn't matter.

You should directly copy this file to your source code directory and use.

```ts
import { renderOTPInput } from 'OTPInput.ts';

const el = document.getElementById('otp-input-container');
const api = renderOTPInput(el, { size: 4 });
api.focus();
```
