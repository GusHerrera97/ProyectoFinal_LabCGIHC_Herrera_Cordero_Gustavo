#version 330 core
struct Material
{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};

struct Light
{
    vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

    
    vec3 ambient;
    vec3 diffuse;

	float constant;
	float linear;
	float specular;
	float quadratic;
};

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 color;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
    // Ambient
    vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords).rgb);
    
    // Diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);//Ya no ocupo la posici�n 
    //vec3 lightDir = normalize(-light.direction);
	
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords).rgb);

    
    // Specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

	//SpotLight
	float theta=dot(lightDir,normalize(-light.direction));
	float epsilon=(light.cutOff-light.outerCutOff);
	float intensity=clamp((theta-light.outerCutOff)/epsilon,0.0,1.0);
	diffuse*=intensity;
	specular*=intensity;

	
	//Attenuation
	float distance=length(light.position-FragPos);
	float attenuation=1.0f/(light.constant+light.linear+distance+light.quadratic*(distance*distance));

	ambient*=attenuation;
	diffuse*=attenuation;
	specular*=attenuation;
	
	vec4 result =vec4(ambient + diffuse + specular,texture(material.diffuse, TexCoords).a);
	if(result.a < 0.1)
        discard;
    color= result;

}