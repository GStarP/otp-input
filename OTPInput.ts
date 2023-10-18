export interface OTPInputOptions {
  // how many number-box
  size?: number
  // class apply to active number-box
  activeClass?: string
}
export interface OTPInputAPI {
  focus: (index?: number) => void
  clean: () => void
  getValue: () => string
  setOnComplete: (handler: MaybeOnComplete) => void
  setOnChange: (handler: MaybeOnChange) => void
}
export type MaybeOnChange = ((value: string) => void) | null
export type MaybeOnComplete = MaybeOnChange

const TAG = '[OTPInput]'

export function renderOTPInput(
  el: HTMLDivElement,
  options?: OTPInputOptions,
): OTPInputAPI {
  const { size = 6, activeClass = 'border-2' } = { ...options }

  let value: string = ''
  let activeIndex = 0
  let onComplete: MaybeOnComplete = null
  let onChange: MaybeOnChange = null

  // decorate the container el
  el.className = 'flex flex-row space-x-2'
  const containerOnClick = (e: Event) => {
    if (!(e instanceof PointerEvent)) {
      console.warn(TAG, 'require PointerEvent', e)
      return
    }
    // only handle event propagated from numberBoxEl
    if (e.target instanceof HTMLDivElement && isNumberBoxEl(e.target)) {
      const index = numberBoxEls.indexOf(e.target)
      focus(index)
    }
  }
  el.addEventListener('click', containerOnClick)

  // prepare <input> to get user input
  const inputEl = document.createElement('input')
  inputEl.className = 'absolute outline-none caret-transparent w-0 h-0'
  const onInput = (event: Event) => {
    if (!(event instanceof InputEvent)) {
      console.warn(TAG, 'require InputEvent', event)
      return
    }
    if (event.inputType === 'insertText') {
      const char = event.data
      if (char !== null && isNum(char)) {
        inputValue(char)
      }
    } else if (event.inputType === 'deleteContentBackward') {
      deleteValue()
    } else {
      // don't support
    }
    // sync value: if input.value='', backspace will not trigger input event
    inputEl.value = value
  }
  inputEl.addEventListener('input', onInput)
  const onBlur = () => {
    numberBoxEls[activeIndex].classList.remove(activeClass)
  }
  inputEl.addEventListener('blur', onBlur)
  el.appendChild(inputEl)

  // prepare multiple <div> to show single number
  const numberBoxEls = new Array(size).fill(0).map(() => {
    const numberBoxEl = document.createElement('div')
    numberBoxEl.className =
      'number-box w-12 h-16 border flex justify-center items-center cursor-text'
    el.appendChild(numberBoxEl)
    return numberBoxEl
  })

  // utils

  const inputValue = (char: string) => {
    if (activeIndex >= size) {
      console.warn(TAG, `activeIndex(${activeIndex}) > size(${size})`)
      return
    }
    if (activeIndex > value.length) {
      console.warn(
        TAG,
        `activeIndex(${activeIndex}) > value.length(${value.length})`,
      )
      return
    }
    // append new number
    if (activeIndex === value.length) {
      value += char
    }
    // change old number
    else {
      value =
        value.substring(0, activeIndex) +
        char +
        value.substring(activeIndex + 1)
    }
    // render number
    numberBoxEls[activeIndex].innerText = char
    // if activeIndex not in the last place, forward once
    if (activeIndex < size - 1) setActiveIndex(activeIndex + 1)
    // must call onChange before onComplete
    if (onChange) onChange(value)
    // if value exceeds size, call onComplete
    if (value.length === size && onComplete) onComplete(value)
  }
  const deleteValue = () => {
    if (activeIndex === 0) {
      value = ''
    }
    // 1 2 3 # => 1 2 #
    // _ _ _ |    _ _ |
    else if (activeIndex === value.length) {
      value = value.substring(0, activeIndex - 1)
      setActiveIndex(activeIndex - 1)
    }
    // 1 2 3  => 1 2 #
    // _ _ |     _ _ |
    else if (activeIndex === value.length - 1) {
      value = value.substring(0, activeIndex)
    } else {
      return
    }
    // render number
    numberBoxEls[activeIndex].innerText = ''

    if (onChange) onChange(value)
  }
  const setActiveIndex = (index: number) => {
    if (index < 0 || index > size - 1) {
      console.warn(TAG, `invalid index=${index} when size=${size}`)
      return
    }
    // 1 2 3 # # => 1 2 3 #
    // _ _ _   ^    _ _ _ |
    if (index > value.length) {
      index = value.length
    }
    numberBoxEls[activeIndex].classList.remove(activeClass)
    activeIndex = index
    numberBoxEls[activeIndex].classList.add(activeClass)
  }
  const isNumberBoxEl = (el: HTMLElement): boolean => {
    return el.classList.contains('number-box')
  }

  // export API

  /**
   * focus on
   */
  const focus = (index?: number) => {
    inputEl.focus()
    if (index !== undefined) setActiveIndex(index)
  }
  /**
   * clean container el
   */
  const clean = () => {
    el.removeEventListener('click', containerOnClick)
    el.innerHTML = ''
  }
  /**
   * get value
   */
  const getValue = () => value

  const setOnComplete = (handler: MaybeOnChange) => (onComplete = handler)
  const setOnChange = (handler: MaybeOnChange) => (onChange = handler)

  return {
    focus,
    clean,
    getValue,
    setOnComplete,
    setOnChange,
  }
}

function isNum(char: string): boolean {
  return char.length === 1 && /[0-9]/.test(char)
}
