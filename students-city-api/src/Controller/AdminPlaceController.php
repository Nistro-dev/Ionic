<?php

namespace App\Controller;

use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminPlaceController extends AbstractController
{
    #[Route('/admin/places', name: 'admin_places')]
    #[IsGranted('ROLE_ADMIN')]
    public function index(EntityManagerInterface $em): Response
    {
        $places = $em->getRepository(Place::class)->findAll();
        return $this->render('admin/places.html.twig', ['places' => $places]);
    }

    #[Route('/admin/places/{id}/validate', name: 'admin_place_validate', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function validate(Place $place, EntityManagerInterface $em): Response
    {
        if ($place->getStatus() === 'en attente') {
            $place->setStatus('validé');
            $em->flush();
            
            $this->addFlash('success', 'Établissement validé avec succès');
        }

        return $this->redirectToRoute('admin_places');
    }

    #[Route('/admin/places/{id}/revoke', name: 'admin_place_revoke', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function revoke(Place $place, EntityManagerInterface $em): Response
    {
        if ($place->getStatus() === 'validé') {
            $place->setStatus('en attente');
            $em->flush();
            
            $this->addFlash('success', 'Établissement révoqué avec succès');
        }

        return $this->redirectToRoute('admin_places');
    }
}