type RequestInitWithOut = Omit<RequestInit, "body">

interface RequestOptions extends RequestInitWithOut {
	body?: object
}

/**
 * Call request to self next.js server from serverComponent and client
 * @description Only work with JSON data
 * @async
 */
export default async function requestLegacy<T = any>(path: string, query?: {[x: string]: any}, options: RequestOptions = {}): Promise<T> {
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

import createHttpError from "http-errors"
import QueryString from "qs"

async function jsonRequest<T>(base: string, url: string, query?: object, options: RequestOptions = {}): Promise<T> {
	const u = new URL(base)
	u.pathname = url
	u.search = ""
	u.hash = ""

	const {body, headers, ...rest} = options

	u.search += QueryString.stringify(query).replace(/^\?/, "")

	const trueHeaders = headers

	const res = await fetch(u.toString(), {
		...(body
			? {
					headers: {
						...trueHeaders,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
			  }
			: {headers: trueHeaders}),
		...rest,
	} as RequestInit)

	let json
	const ContentType = res.headers.get("content-type")
	const status = res.status
	let content = ""

	try {
		if (!ContentType?.includes("application/json")) content = await res.json()
	} catch (error) {
		try {
			if (!ContentType?.includes("application/json")) content = await res.text()
		} catch (error) {}
	}

	if (!ContentType?.includes("application/json")) throw createHttpError(500, "Not JSON", {"content-type": ContentType, content, status})

	try {
		json = await res.json()
	} catch (error) {
		throw createHttpError(status, json)
	}
	if (!res.ok) throw createHttpError(status, json)

	return json
}
