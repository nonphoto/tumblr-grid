const apiKey = 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8'
const scrollThreshold = 100
const postLimit = 50

let username = null
let postCount = 0
let lastPostTimestamp = 0
let isLoading = false
let hasPostsRemaining = true

function request(url, params) {
	params.callback = 'requestCallback'
	const queryString = Object
		.entries(params)
		.reduce((acc, val) => {
			acc.push(`${val[0]}=${val[1]}`)
			return acc
		}, [])
		.join('&')

	const src = `${url}?${queryString}`

	const promise = new Promise((resolve, reject) => {
		window.requestCallback = (data) => {
			window.requestCallback = undefined
			resolve(data)
		}

		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.async = true
		script.src = src

		const head = document.getElementsByTagName('head')[0]
		head.appendChild(script)
	})

	return promise
}

function createFragmentForPosts(posts) {
	const fragment = document.createDocumentFragment()

	posts.forEach(post => {
		if (post.type === 'photo') {
			post.photos.forEach(photo => {
				const tile = document.createElement('div')
				tile.classList.add('tile')

				const fullImage = photo.alt_sizes[0]
				const thumbnailImage = photo.alt_sizes[photo.alt_sizes.length - 1]

				tile.style.backgroundImage = `url(${thumbnailImage.url})`
				tile.addEventListener('click', () => {
					viewer.classList.add('is-active')
					viewerImage.src = fullImage.url
					viewerImage.dataset.href = post.post_url
				})

				fragment.appendChild(tile)
			})
		}
		else {
			const tile = document.createElement('div')
			tile.classList.add('tile')

			tile.classList.add('has-no-image')
			tile.addEventListener('click', () => {
				window.open(post.post_url, '_blank')
			})

			fragment.appendChild(tile)
		}
	})

	return fragment
}

function hasScrolledToBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - scrollThreshold)
}

document.addEventListener('DOMContentLoaded', () => {
	const hint = document.getElementById('hint')
	const spinner = document.getElementById('spinner')
	const form = document.getElementById('form-username')
	const formText = document.getElementById('text-username')
	const viewer = document.getElementById('viewer')
	const viewerImage = document.getElementById('viewer-image')
	const tileContainer = document.getElementById('tile-container')

	form.addEventListener('submit', () => {
		hint.classList.add('is-hidden')
		username = formText.value
		postCount = 0
		lastPostTimestamp = 0
		hasPostsRemaining = true

		while (tileContainer.firstChild) {
			tileContainer.removeChild(tileContainer.firstChild)
		}

		loadImages()
		return false
	})

	viewer.addEventListener('click', () => {
		viewer.classList.remove('is-active')
	})

	viewerImage.addEventListener('click', (e) => {
		window.open(viewerImage.dataset.href, '_blank')
		e.stopPropagation()
	})

	window.addEventListener('scroll', () => {
		if (hasPostsRemaining && hasScrolledToBottom()) {
			loadImages()
		}
	})

	const loadImages = () => {
		if (!username) return
		if (isLoading) return
		if (!hasPostsRemaining) return

		isLoading = true

		spinner.classList.add('is-visible')

		const onLoadEnd = () => {
			spinner.classList.remove('is-visible')
			isLoading = false
		}

		const params = {
			api_key: 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8',
			limit: postLimit
		}

		if (postCount < 1000) {
			params.offset = postCount
		}
		else {
			params.before = lastPostTimestamp
		}

		request(`https://api.tumblr.com/v2/blog/${username}.tumblr.com/likes`, params)
			.then((data) => {
				const posts = data.response.liked_posts

				if (posts.length <= 0) {
					hasPostsRemaining = false
					onLoadEnd()
					return
				}

				const fragment = createFragmentForPosts(posts)
				tileContainer.appendChild(fragment)

				lastPostTimestamp = posts[posts.length - 1].timestamp
				postCount += postLimit

				onLoadEnd()

				if (hasScrolledToBottom()) {
					loadImages()
				}
			})
			.catch((error) => {
				console.error(error)
				onLoadEnd()
			})
	}
})
