import Follow from "../models/follow.js"
import User from "../models/user.js"


// Acciones de prueba
export const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: follow.js"
  });
}

// Método para guardar un follow (seguir a otro usuario)
export const saveFollow = async (req, res) =>{
  try {
    // Obtener datos del body
    const { followed_user } = req.body;

    // Obtener el id del usuario autenticado (login) desde el token
    const identity = req.user;

    // Verificar si "identity" contiene la información del usuario autenticado
    if (!identity || !identity.userId){
      return res.status(400).send({
        status: "error",
        message: "No se ha proporcionado el usuario para realizar el following"
      });
    }

    // Verificar si el usuario está intentando seguirse a sí mismo
    if (identity.userId === followed_user) {
      return res.status(400).send({
        status: "error",
        message: "No puedes seguirte a ti mismo"
      });
    }

    // Verificar si el usuario a seguir existe
    const followedUser = await User.findById(followed_user);
    if (!followedUser) {
      return res.status(404).send({
        status: "error",
        message: "El usuario que intentas seguir no existe"
      });
    }

    // Verificar si ya existe un seguimiento con los mismos usuarios
    const existingFollow = await Follow.findOne({
      following_user: identity.userId,
      followed_user: followed_user
    });

    if(existingFollow) {
      return res.status(400).send({
        status: "error",
        message: "Ya estás siguiendo a este usuario."
      });
    }

    // Crear el objeto con modelo follow
    const newFollow = new Follow({
      following_user: identity.userId,
      followed_user: followed_user
    });

    // Guardar objeto en la BD
    const followStored = await newFollow.save();

    // Verificar si se guardó correctamente en la BD
    if(!followStored) {
      return res.status(500).send({
        status: "error",
        message: "No se ha podido seguir al usuario."
      });
    }

    // Obtener el nombre y apellido del usuario seguido
    const followedUserDetails = await User.findById(followed_user).select('name last_name');

    if (!followedUserDetails) {
      return res.status(404).send({
        status: "error",
        message: "Usuario seguido no encontrado"
      });
    }
    
    // Combinar datos de follow y followedUser
    const combinedFollowData = {
      ...followStored.toObject(),
      followedUser: {
        name: followedUserDetails.name,
        last_name: followedUserDetails.last_name
      }
    };


    // Devolver respuesta
    return res.status(200).json({
      status: "success",
      identity: req.user,
      follow: combinedFollowData
    });

  } catch (error) {
    if (error.code === 11000) { // Error de índice único duplicado
      return res.status(400).json({
        status: "error",
        message: "Ya estás siguiendo a este usuario."
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Error al seguir al usuario.",
    });
  }
}


// Método para eliminar un follow (dejar de seguir)

// Método para listar usuarios que estoy siguiendo

// Método para listar los usuarios que me siguen