<?php
// src/Controller/AdminUserController.php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminUserController extends AbstractController
{
    #[Route('/admin/users', name: 'admin_users')]
    #[IsGranted('ROLE_ADMIN')]
    public function index(EntityManagerInterface $em): Response
    {
        $users = $em->getRepository(User::class)->findAll();
        return $this->render('admin/users.html.twig', ['users' => $users]);
    }

    #[Route('/admin/users/{id}/validate', name: 'admin_user_validate', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function validate(User $user, EntityManagerInterface $em): Response
    {
        if ($user->getStatus() === 'en attente') {
            $user->setStatus('validé');
            $user->setRoles(['ROLE_USER']);
            $em->flush();
            
            $this->addFlash('success', 'Utilisateur validé avec succès');
        }

        return $this->redirectToRoute('admin_users');
    }

    #[Route('/admin/users/{id}/revoke', name: 'admin_user_revoke', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function revoke(User $user, EntityManagerInterface $em): Response
    {
        if ($user->getStatus() === 'validé') {
            $user->setStatus('en attente');
            $user->setRoles([]);
            $em->flush();
            
            $this->addFlash('success', 'Utilisateur révoqué avec succès');
        }

        return $this->redirectToRoute('admin_users');
    }
}