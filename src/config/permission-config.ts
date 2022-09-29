interface PermissionConfigInterface {
  roles: Array<rolePayload>;
  defaultRoutes?: Array<RoutePayloadInterface>;
  modules: Array<ModulesPayloadInterface>;
}

interface rolePayload {
  id: number;
  name: string;
  description: string;
}

export enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ANY = 'any',
  OPTIONS = 'options'
}

export interface RoutePayloadInterface {
  path: string;
  method: MethodList;
  resource?: string;
  description?: string;
  isDefault?: boolean;
}

export interface ModulesPayloadInterface {
  name: string;
  resource: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

export interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

export interface PermissionPayload {
  name: string;
  resource?: string;
  route: Array<RoutePayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  roles: [
    {
      id: 1,
      name: 'superuser',
      description: 'superuser of the system'
    },
    {
      id: 2,
      name: 'provider',
      description: 'user that provides services and products'
    },
    {
      id: 3,
      name: 'admin',
      description: 'user that manages system'
    }
  ],
  defaultRoutes: [
    {
      path: '/check',
      method: MethodList.GET
    },
    {
      path: '/auth/register',
      method: MethodList.POST
    },
    {
      path: '/auth/login',
      method: MethodList.POST
    },
    {
      path: '/auth/profile',
      method: MethodList.GET
    },
    {
      path: '/auth/activate-account',
      method: MethodList.GET
    },
    {
      path: '/auth/forgot-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/reset-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/change-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/profile',
      method: MethodList.PUT
    },
    {
      path: '/revoke/:id',
      method: MethodList.PUT
    },
    {
      path: '/auth/token-info',
      method: MethodList.GET
    },
    {
      path: '/dashboard/users',
      method: MethodList.GET
    },
    {
      path: '/dashboard/os',
      method: MethodList.GET
    },
    {
      path: '/dashboard/browser',
      method: MethodList.GET
    },
    {
      path: '/logout',
      method: MethodList.POST
    }
  ],
  modules: [
    {
      name: 'User management',
      resource: 'user',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all user',
          route: [
            {
              path: '/users',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new user',
          route: [
            {
              path: '/users',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update user by id',
          route: [
            {
              path: '/users/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Get user by id',
          route: [
            {
              path: '/users/:id',
              method: MethodList.GET
            }
          ]
        }
      ]
    },
    {
      name: 'Role management',
      resource: 'role',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all role',
          route: [
            {
              path: '/roles',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new role',
          route: [
            {
              path: '/roles',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Permission management',
      resource: 'permission',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all permission',
          route: [
            {
              path: '/permissions',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Sync permission from config',
          route: [
            {
              path: '/permissions/sync',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'View permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new permission',
          route: [
            {
              path: '/permissions',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Email Templates',
      resource: 'emailTemplates',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all email templates',
          route: [
            {
              path: '/email-templates',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View email templates by id',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new email templates',
          route: [
            {
              path: '/email-templates',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update email templates by id',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete email templates by id',
          route: [
            {
              path: '/email-templates/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Provider Management',
      resource: 'providerInformations',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all providers',
          route: [
            {
              path: '/providers',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View provider by id',
          route: [
            {
              path: '/providers/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new provider',
          route: [
            {
              path: '/providers/register',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update providers by id',
          route: [
            {
              path: '/providers/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Update provider day schedules',
          route: [
            {
              path: '/providers/:id/day-schedules',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Get provider day schedules',
          route: [
            {
              path: '/providers/:id/day-schedules',
              method: MethodList.GET
            }
          ]
        }
      ]
    },
    {
      name: 'Customer Management',
      resource: 'customer',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all customers',
          route: [
            {
              path: '/customer',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View customer by id',
          route: [
            {
              path: '/customer/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Update customer by id',
          route: [
            {
              path: '/customer/:id',
              method: MethodList.PUT
            }
          ]
        }
      ]
    },
    {
      name: 'Banner management',
      resource: 'banner',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all banners',
          route: [
            {
              path: '/banner',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View banner by id',
          route: [
            {
              path: '/banner/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new banner',
          route: [
            {
              path: '/banner',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update banner by id',
          route: [
            {
              path: '/banner/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete banner by id',
          route: [
            {
              path: '/banner/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Category management',
      resource: 'category',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all categories',
          route: [
            {
              path: '/category',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View category by id',
          route: [
            {
              path: '/category/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new category',
          route: [
            {
              path: '/category',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update category by id',
          route: [
            {
              path: '/category/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete category by id',
          route: [
            {
              path: '/category/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Menu management',
      resource: 'menu',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all menus',
          route: [
            {
              path: '/menu',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View menu by id',
          route: [
            {
              path: '/menu/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new menu',
          route: [
            {
              path: '/menu',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update menu by id',
          route: [
            {
              path: '/menu/:id',
              method: MethodList.PUT
            }
          ]
        },
        {
          name: 'Delete menu by id',
          route: [
            {
              path: '/menu/:id',
              method: MethodList.DELETE
            }
          ]
        }
      ]
    },
    {
      name: 'Specialist management',
      resource: 'specialist',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all specialist/doctors',
          route: [
            {
              path: '/specialist',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View specialist detail by id',
          route: [
            {
              path: '/specialist/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new specialist',
          route: [
            {
              path: '/specialist',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update specialist by id',
          route: [
            {
              path: '/specialist/:id',
              method: MethodList.PUT
            }
          ]
        }
      ]
    },
    {
      name: 'Service management',
      resource: 'service',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all services',
          route: [
            {
              path: '/service',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'View service detail by id',
          route: [
            {
              path: '/service/:id',
              method: MethodList.GET
            }
          ]
        },
        {
          name: 'Store new service',
          route: [
            {
              path: '/service',
              method: MethodList.POST
            }
          ]
        },
        {
          name: 'Update service by id',
          route: [
            {
              path: '/service/:id',
              method: MethodList.PUT
            }
          ]
        }
      ]
    }
  ]
};
