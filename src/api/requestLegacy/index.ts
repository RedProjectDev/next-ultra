type RequestInitWithOut = Omit<RequestInit, "body">

interface RequestOptions extends RequestInitWithOut {
	body?: object
}

/**
 * Call request to self next.js server from serverComponent and client
 * @description Only work with JSON data
 * @async
 */
export default async function requestLegacy<T = any>(
	path: string,
	query?: {[x: string]: any},
	options: RequestOptions & {responseType?: "json" | "blob" | "text"} = {}
): Promise<T> {
	if (typeof window !== "undefined") {
		;("use client")
		/* Client side */
		return await jsonRequest(window.location.origin, `/api${path}`, query, options)
	} else {
		;("use server")
		/* Server side */

		const {cookies} = await import("next/headers")

		const Cookie = cookies()
			.getAll()
			.map((e: {[x: string]: any}) => e?.name + "=" + e?.value + ";path=/;expires=Session")
			.join(";")

		return await jsonRequest<T>(`http://localhost:${process.env.PORT}`, `/api${path}`, query, {
			...options,
			headers: {
				...(options?.headers ?? {}),
				Cookie,
			},
		})
	}
}

import axios, {AxiosResponse} from "axios"

async function jsonRequest<T>(base: string, url: string, query?: object, options: RequestOptions & {responseType?: "json" | "blob" | "text"} = {}): Promise<T> {
	const a = axios.create({
		baseURL: base,
		params: query,
		responseType: options.responseType,
		headers: options.headers as any,
	})

	const {body, method = "get"} = options

	let res: AxiosResponse<T>
	if (options.body) {
		res = await a[method as "post" | "patch" | "put"](url, body)
	} else {
		res = await a[method as "get" | "head" | "delete"](url)
	}

	return res.data
}
