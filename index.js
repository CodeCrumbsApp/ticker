;(function (global) {
	global.Ticker = function ({ tickerSelector = '.cc-ticker' }) {
		const tracks = document.querySelectorAll(tickerSelector)

		tracks.forEach((track) => {
			const list = track.firstElementChild
			const listWidth = list.clientWidth
			const windowWidth = window.innerWidth
			const gap = parseInt(track.getAttribute('cc-ticker-gap')) || 0
			const speed = parseFloat(track.getAttribute('cc-ticker-speed')) || 10
			const pauseOnHover =
				track.getAttribute('cc-ticker-pause') === 'true' || false
			const reverse =
				track.getAttribute('cc-ticker-reverse') === 'true' || false
			let isPaused = false

			function setGap(element, gap) {
				element.setAttribute('style', `gap: ${gap}px;`)
			}

			function cloneList() {
				setGap(list, gap)

				if (listWidth < windowWidth) {
					const cloneNumber = Math.round((windowWidth * 2) / listWidth - 1)

					for (let i = 0; i < cloneNumber; i++) {
						const listClone = list.cloneNode(true)

						if (reverse) {
							track.insertBefore(listClone, track.firstElementChild)
						} else {
							track.appendChild(listClone)
						}
					}
					setGap(track, gap)

					if (reverse) {
						track.style.justifyContent = 'flex-end'
					}
				}
			}

			function animate(timestamp, prevTimestamp) {
				if (!prevTimestamp) prevTimestamp = timestamp

				if (!isPaused) {
					const progress = timestamp - prevTimestamp
					const xOffset = (progress * listWidth) / (speed * 1000)
					// Positive value for reverse, negative value for normal direction
					const direction = reverse ? 1 : -1
					const tickerLists = Array.from(track.children)

					tickerLists.forEach((list) => {
						const newX =
							(parseFloat(list.style.transform.split('(')[1]) || 0) +
							direction * xOffset

						if (reverse) {
							if (newX >= listWidth + gap * 3) {
								list.style.transform = 'translateX(0px)'
							} else {
								list.style.transform = `translateX(${newX}px)`
							}
						} else {
							if (newX <= -(listWidth + gap * 3)) {
								list.style.transform = 'translateX(0px)'
							} else {
								list.style.transform = `translateX(${newX}px)`
							}
						}
					})
				}

				requestAnimationFrame((newTimestamp) =>
					animate(newTimestamp, timestamp)
				)
			}

			if (pauseOnHover) {
				track.addEventListener('mouseenter', () => {
					isPaused = true
				})

				track.addEventListener('mouseleave', () => {
					isPaused = false
				})
			}

			cloneList()
			requestAnimationFrame(animate)
		})
	}
})((globalThis.CodeCrumbs = globalThis.CodeCrumbs || {}))
