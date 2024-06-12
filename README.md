# next-ultra

> Ultra pack utils for next.js by RedProject

[![NPM](https://img.shields.io/npm/v/next-ultra.svg)](https://www.npmjs.com/package/next-ultra) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

`npm install --save next-ultra`

## Usage

###isMobileDevice _(server)_

> Check is mobile device from user agent
> return Promise&lsaquo;boolean&rsaquo;

```tsx
import {isMobileDevice} from "next-ultra/utils"

export default async function Page() {
	const isMobile = isMobileDevice()

	return isMobile ? <div>Device is mobile</div> : <div>Device is PC</div>
}
```

## License

MIT © [RedProjectDev](https://github.com/RedProjectDev)
