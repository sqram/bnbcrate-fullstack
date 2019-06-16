import validator from 'validator'

const settings = { }


settings.global = {
  password: {
    minLength: 4,
    maxLength: 45,
    message: 'Password must be between 4 - 45 characters'
  },  
}

export default settings